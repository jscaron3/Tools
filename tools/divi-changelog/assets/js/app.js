(() => {
  // Paths are relative so the site works under a GitHub Pages project URL (/repo/).
  const SOURCES = { "divi-4": "data/divi-4.json", "divi-5": "data/divi-5.json" };
  const META_PATH = "data/meta.json";
  const TYPE_LABELS = { feature: "Features", improvement: "Improvements", bug: "Bug fixes", security: "Security" };

  const state = {
    product: "all",
    query: "",
    from: "",
    to: "",
    types: new Set(Object.keys(TYPE_LABELS)),
    data: {},
    meta: null,
  };

  const $ = (id) => document.getElementById(id);

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value);
    }
    for (const child of children) if (child) node.append(child);
    return node;
  }

  function formatDate(iso, withTime = false) {
    const date = new Date(withTime ? iso : `${iso}T00:00:00`);
    return withTime
      ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function setStatus(message) {
    $("status").textContent = message;
  }

  async function fetchJson(path, bust) {
    const url = bust ? `${path}?t=${Date.now()}` : path;
    const response = await fetch(url, { cache: bust ? "no-store" : "default" });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }

  async function loadAll(bust = false) {
    setStatus("Loading…");
    const keys = Object.keys(SOURCES);
    const results = await Promise.allSettled([
      ...keys.map((key) => fetchJson(SOURCES[key], bust)),
      fetchJson(META_PATH, bust),
    ]);

    const errors = [];
    keys.forEach((key, index) => {
      const result = results[index];
      if (result.status === "fulfilled") {
        state.data[key] = result.value;
        state.data[key].releases.sort((a, b) => b.date.localeCompare(a.date));
      } else {
        errors.push(result.reason.message);
      }
    });

    const metaResult = results[keys.length];
    state.meta = metaResult.status === "fulfilled" ? metaResult.value : null;
    renderSyncInfo(errors);
    render();
    if (errors.length) setStatus(`Some data could not be loaded: ${errors.join("; ")}`);
  }

  function renderSyncInfo(errors) {
    const parts = [];
    if (state.meta?.lastSync) parts.push(formatDate(state.meta.lastSync, true));
    else parts.push("unknown");
    const failing = Object.entries(state.meta?.sources ?? {})
      .filter(([, s]) => s.status === "error")
      .map(([key]) => (key === "divi-4" ? "Divi 4" : "Divi 5"));
    if (failing.length) parts.push(`${failing.join(" and ")} sync failed; showing saved data`);
    if (errors.length && !failing.length) parts.push("some files missing");
    $("last-sync").textContent = parts.join(" · ");
  }

  function visibleEntries() {
    const keys = state.product === "all" ? Object.keys(state.data) : [state.product];
    const entries = [];
    for (const key of keys) {
      const dataset = state.data[key];
      if (!dataset) continue;
      dataset.releases.forEach((release, index) => {
        if (state.from && release.date < state.from) return;
        if (state.to && release.date > state.to) return;

        const versionMatches = !state.query || release.version.toLowerCase().includes(state.query);
        const items = (release.items || []).filter(
          (item) =>
            state.types.has(item.type) &&
            (!state.query || versionMatches || item.text.toLowerCase().includes(state.query))
        );
        if (!items.length) return;

        entries.push({
          product: dataset.product,
          release,
          items,
          latest: index === 0,
        });
      });
    }
    return entries.sort((a, b) => b.release.date.localeCompare(a.release.date));
  }

  function renderCard({ product, release, items, latest }) {
    const groups = Object.keys(TYPE_LABELS).map((type) => {
      const texts = items.filter((item) => item.type === type).map((item) => item.text);
      if (!texts.length) return null;
      return el(
        "section",
        { class: `group group-${type}` },
        el("h3", { text: TYPE_LABELS[type] }),
        el("ul", {}, ...texts.map((text) => el("li", { text })))
      );
    });

    const files = release.files?.length
      ? el(
          "details",
          { class: "files" },
          el("summary", { text: `Files changed (${release.files.length})` }),
          el("ul", {}, ...release.files.map((file) => el("li", { text: file })))
        )
      : null;

    const count = items.length;
    return el(
      "li",
      { class: "release" },
      el(
        "details",
        {},
        el(
          "summary",
          {},
          el("span", { class: "badge product", text: product }),
          el("span", { class: "version", text: release.version }),
          el("time", { class: "date", datetime: release.date, text: formatDate(release.date) }),
          latest ? el("span", { class: "badge latest", text: "Latest" }) : null,
          el("span", { class: "count", text: `${count} change${count === 1 ? "" : "s"}` })
        ),
        ...groups,
        files
      )
    );
  }

  function render() {
    const entries = visibleEntries();
    const list = $("releases");
    list.replaceChildren(...entries.map(renderCard));
    if (!Object.keys(state.data).length) return;
    setStatus(entries.length ? `${entries.length} release${entries.length === 1 ? "" : "s"} shown` : "No releases match your filters.");
  }

  function syncControls() {
    document.querySelectorAll("[role=tab]").forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.product === state.product));
    });
    $("search").value = state.query;
    $("from").value = state.from;
    $("to").value = state.to;
    document.querySelectorAll("input[name=type]").forEach((box) => {
      box.checked = state.types.has(box.value);
    });
  }

  function bindEvents() {
    document.querySelectorAll("[role=tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        state.product = tab.dataset.product;
        syncControls();
        render();
      });
    });

    $("search").addEventListener("input", (event) => {
      state.query = event.target.value.trim().toLowerCase();
      render();
    });
    $("from").addEventListener("change", (event) => {
      state.from = event.target.value;
      render();
    });
    $("to").addEventListener("change", (event) => {
      state.to = event.target.value;
      render();
    });
    document.querySelectorAll("input[name=type]").forEach((box) => {
      box.addEventListener("change", () => {
        if (box.checked) state.types.add(box.value);
        else state.types.delete(box.value);
        render();
      });
    });

    $("reset").addEventListener("click", () => {
      Object.assign(state, { query: "", from: "", to: "", types: new Set(Object.keys(TYPE_LABELS)) });
      syncControls();
      render();
    });

    $("refresh").addEventListener("click", () => loadAll(true));
  }

  bindEvents();
  loadAll();
})();
