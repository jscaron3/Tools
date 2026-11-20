#!/usr/bin/env python3
"""Fetch Divi 4 and Divi 5 release notes and store them as JSON in data/.

Existing releases are kept when a source is unavailable or cannot be parsed.
Only the standard library is used so the workflow needs no pip install.
"""
import datetime
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DIVI4_URL = "https://www.elegantthemes.com/api/changelog/divi.txt"
DIVI5_URL = "https://www.elegantthemes.com/api/changelog/divi-5.txt"  # same format as DIVI4_URL
USER_AGENT = "divi-changelog-updater/1.0"
TIMEOUT_SECONDS = 30

DIVI4_HEADER = re.compile(r"^version\s+(\d+(?:\.\d+)+)\s*\(\s*updated\s+(\d{2}-\d{2}-\d{4})\s*\)$", re.I)
MOJIBAKE_RUN = re.compile(r"[^\x00-\x7f]+")


class ParseError(Exception):
    pass


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return response.read().decode("utf-8", errors="replace")


def _fix_run(match):
    run = match.group(0)
    raw = bytearray()
    for char in run:
        # cp1252 maps most mojibake chars; latin-1 covers undefined cp1252 bytes such as 0x9D.
        for encoding in ("cp1252", "latin-1"):
            try:
                raw += char.encode(encoding)
                break
            except UnicodeEncodeError:
                continue
        else:
            return run
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return run


def fix_mojibake(text):
    """Repair UTF-8 text that was decoded as cp1252, e.g. '360Â°' -> '360°'."""
    return MOJIBAKE_RUN.sub(_fix_run, text)


def to_iso(mdy):
    return datetime.datetime.strptime(mdy, "%m-%d-%Y").date().isoformat()


def version_key(version):
    return tuple(int(part) for part in version.split("."))


def classify(text):
    lowered = text.lower()
    if lowered.startswith("security"):
        return "security"
    if lowered.startswith("fix"):
        return "bug"
    if re.match(r"(add|added|new)\b", lowered):
        return "feature"
    return "improvement"


def make_item(text, kind=None):
    return {"type": kind or classify(text), "text": " ".join(text.split())}


def parse_changelog_txt(text):
    """Parse the plain-text format shared by divi.txt and divi-5.txt."""
    text = fix_mojibake(text)
    releases, current = [], None
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("/*") or line == "*/":
            continue
        header = DIVI4_HEADER.match(line)
        if header:
            current = {"version": header.group(1), "date": to_iso(header.group(2)), "items": [], "files": []}
            releases.append(current)
        elif current is None:
            continue
        elif raw[:1] in ("\t", " ") and line.startswith("*"):
            current["files"].append(line.lstrip("* ").strip())
        elif line.startswith("- "):
            current["items"].append(make_item(line[2:]))
    return releases


def merge_releases(existing, fresh):
    """Add or update releases by version; keep older releases that the source no longer lists."""
    merged = {release["version"]: release for release in existing}
    for release in fresh:
        # Never replace stored notes with an empty (possibly truncated) parse.
        if not release["items"] and release["version"] in merged:
            continue
        merged[release["version"]] = release
    return sorted(merged.values(), key=lambda r: version_key(r["version"]), reverse=True)


def load_json(path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def sync_source(cfg):
    path = DATA_DIR / cfg["file"]
    existing = load_json(path, {"releases": []})
    fresh = cfg["parser"](fetch(cfg["url"]))
    if not fresh:
        raise ParseError("no releases found in source")
    document = {
        "product": cfg["label"],
        "source": cfg["url"],
        "releases": merge_releases(existing.get("releases", []), fresh),
    }
    if document == existing:
        return False
    path.write_text(json.dumps(document, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return True


SOURCES = {
    "divi-4": {"label": "Divi 4", "url": DIVI4_URL, "parser": parse_changelog_txt, "file": "divi-4.json"},
    "divi-5": {"label": "Divi 5", "url": DIVI5_URL, "parser": parse_changelog_txt, "file": "divi-5.json"},
}


def main():
    DATA_DIR.mkdir(exist_ok=True)
    meta_path = DATA_DIR / "meta.json"
    meta = load_json(meta_path, {"sources": {}})
    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()
    succeeded = 0

    for key, cfg in SOURCES.items():
        previous = meta["sources"].get(key, {})
        try:
            changed = sync_source(cfg)
            count = len(load_json(DATA_DIR / cfg["file"], {"releases": []})["releases"])
            print(f"[{key}] ok, {count} releases, {'updated' if changed else 'no changes'}")
            status = {"status": "ok", "checkedAt": now, "lastSuccess": now, "lastError": None, "releaseCount": count}
            succeeded += 1
        except Exception as exc:  # keep saved data; record the failure
            print(f"[{key}] failed, keeping saved data: {exc}", file=sys.stderr)
            status = {
                "status": "error",
                "checkedAt": now,
                "lastSuccess": previous.get("lastSuccess"),
                "lastError": str(exc),
                "releaseCount": previous.get("releaseCount"),
            }
        meta["sources"][key] = status

    if succeeded:
        meta["lastSync"] = now
    elif "lastSync" not in meta:
        meta["lastSync"] = None
    meta_path.write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    return 0 if succeeded else 1


if __name__ == "__main__":
    sys.exit(main())
