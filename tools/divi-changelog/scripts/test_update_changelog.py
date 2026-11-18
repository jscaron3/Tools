import importlib.util
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location(
    "update_changelog", Path(__file__).resolve().parent / "update-changelog.py"
)
uc = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(uc)

DIVI4_SAMPLE = """version 4.27.8 ( updated 08-19-2026 )
- Fixed Theme Builder Shop page templates not rendering on the frontend with WooCommerce 11.0.

version 4.27.7 ( updated 05-12-2026 )
- Security Update: Fixed a stored XSS risk in Social Media Follow Skype URL handling.
- Add the option to opt in to Divi 5 updates in the Divi Dashboard.
- Updated Divi AI with new image, text, and code generation models.

version 4.27.4 ( updated 11-25-2024 )
- Fixed issue where image with lazy loading enabled are distorted on WordPress 6.7.
	* includes/builder/core.php
"""

DIVI5_SAMPLE = """version 5.19.0 ( updated 11-06-2026 )
- Fixed a Builder crash when adding Text modules with the 360Â° Product Rotation plugin active.
- Improved global variable selection by showing full names on hover.
- Added collaborative Notes to the Visual Builder with element-linked conversations.

version 5.18.2 ( updated 11-02-2026 )
- Fixed Contact Form fields closing click-triggered Tooltips when users tried to enter text.

version 5.18.1 ( updated 10-28-2026 )
- Fixed pages containing only components not appearing in â€œYour Existing Pagesâ€\u009d when cloning a layout.
"""


class ParseDivi4(unittest.TestCase):
    def test_parses_versions_dates_and_item_types(self):
        releases = uc.parse_changelog_txt(DIVI4_SAMPLE)
        self.assertEqual([r["version"] for r in releases], ["4.27.8", "4.27.7", "4.27.4"])
        self.assertEqual(releases[1]["date"], "2026-05-12")
        types = [item["type"] for item in releases[1]["items"]]
        self.assertEqual(types, ["security", "feature", "improvement"])

    def test_indented_lines_become_files_not_items(self):
        releases = uc.parse_changelog_txt(DIVI4_SAMPLE)
        self.assertEqual(releases[2]["files"], ["includes/builder/core.php"])
        self.assertEqual(len(releases[2]["items"]), 1)


class ParseDivi5(unittest.TestCase):
    def test_parses_three_part_versions_and_item_types(self):
        releases = uc.parse_changelog_txt(DIVI5_SAMPLE)
        self.assertEqual([r["version"] for r in releases], ["5.19.0", "5.18.2", "5.18.1"])
        self.assertEqual(releases[0]["date"], "2026-11-06")
        self.assertEqual([i["type"] for i in releases[0]["items"]], ["bug", "improvement", "feature"])

    def test_repairs_mojibake(self):
        releases = uc.parse_changelog_txt(DIVI5_SAMPLE)
        self.assertIn("360° Product Rotation", releases[0]["items"][0]["text"])
        self.assertIn("“Your Existing Pages”", releases[2]["items"][0]["text"])


class MergeReleases(unittest.TestCase):
    def test_keeps_history_and_updates_matching_versions(self):
        old = [{"version": "5.18.2", "date": "2026-11-02", "items": [{"type": "bug", "text": "old"}]},
               {"version": "5.1", "date": "2025-01-01", "items": [{"type": "bug", "text": "ancient"}]}]
        new = [{"version": "5.19", "date": "2026-11-06", "items": [{"type": "feature", "text": "new"}]},
               {"version": "5.18.2", "date": "2026-11-02", "items": []}]
        merged = uc.merge_releases(old, new)
        self.assertEqual([r["version"] for r in merged], ["5.19", "5.18.2", "5.1"])
        self.assertEqual(merged[1]["items"][0]["text"], "old")


if __name__ == "__main__":
    unittest.main()
