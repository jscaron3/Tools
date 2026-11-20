(function(){
  const DAYS = 30;
  const CACHE_VULN = 'merged-vuln-cache-v1';
  const CACHE_CHANGE = 'merged-change-cache-v1';
  const PREFS = 'merged-prefs-v1';
  const SOURCES = { "divi-4": "tools/essentials/dev-dashboard/data/divi-4.json", "divi-5": "tools/essentials/dev-dashboard/data/divi-5.json" };
  const META_PATH = "tools/essentials/dev-dashboard/data/meta.json";
  const TYPE_LABELS = { feature: "Features", improvement: "Improvements", bug: "Bug fixes", security: "Security" };
  const KEYWORDS = [
    {k:'WordPress', on:true}, {k:'PHP', on:true}, 
    {k:'jQuery', on:true}, {k:'DirectAdmin', on:true},
    {k:'MySQL', on:true}, {k:'Apache', on:true}, {k:'nginx', on:true}
  ];

  const vulnData = { data: [], fetchedAt: null };
  const changeData = { data: {}, meta: null };

  const $ = (id) => document.getElementById(id);




  // Stop animation
  const pendingStops = new WeakMap();


  function startLoading(btn) {
  pendingStops.get(btn)?.(); // cancel any pending stop
  btn.classList.add('loading');
}

function stopLoading(btn) {
  const svg = btn.querySelector('svg');
  if (!svg || !btn.classList.contains('loading')) {
    btn.classList.remove('loading');
    return;
  }

  pendingStops.get(btn)?.(); // avoid stacking listeners

  const finish = () => {
    cancel();
    btn.classList.remove('loading');
  };
  const cancel = () => {
    clearTimeout(timer);
    svg.removeEventListener('animationiteration', finish);
    pendingStops.delete(btn);
  };

  // Fallback if the event never fires (hidden tab, reduced motion, etc.)
  const timer = setTimeout(finish, 1200);
  svg.addEventListener('animationiteration', finish);
  pendingStops.set(btn, cancel);
}


  /* ========== UTILITIES ========== */
  function esc(s){ return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]); }

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; } }

  function formatDate(iso, withTime = false) {
    const date = new Date(withTime ? iso : `${iso}T00:00:00`);
    return withTime
      ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function sevColor(s){ return {CRITICAL:'var(--crit)',HIGH:'var(--high)',MEDIUM:'var(--med)',LOW:'var(--low)'}[s] || 'var(--na)'; }
  function sevLabel(s){ return {CRITICAL:'Critical',HIGH:'High',MEDIUM:'Medium',LOW:'Low'}[s] || 'Not scored'; }

  /* ========== TAB SWITCHING ========== */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      $(`${tab}`).classList.add('active');
      btn.classList.add('active');
    });
  });

  /* ========== VULNERABILITY SECTION ========== */
  
  function setVulnStatus(msg, err){ 
    const s = $('vulnStatus'); 
    s.textContent = msg; 
    s.className = 'status' + (err ? ' err' : ''); 
  }

  // Setup keyword chips
  let prefs = load(PREFS);
  if(prefs && prefs.kw){ KEYWORDS.forEach(o => { if(o.k in prefs.kw) o.on = prefs.kw[o.k]; }); }
  KEYWORDS.forEach(o => {
    const l = document.createElement('label');
    l.className = 'chip';
    l.innerHTML = `<input type="checkbox"> ${o.k}`;
    const cb = l.querySelector('input');
    cb.checked = o.on;
    cb.addEventListener('change', () => {
      o.on = cb.checked;
      const m = {}; KEYWORDS.forEach(x => { m[x.k] = x.on; }); 
      save(PREFS, {kw:m});
    });
    $('kwRow').appendChild(l);
  });

  function parseVuln(item, kw){
    const c = item.cve, m = c.metrics || {};
    const met = (m.cvssMetricV40||[])[0] || (m.cvssMetricV31||[])[0] || (m.cvssMetricV30||[])[0] || (m.cvssMetricV2||[])[0];
    const score = met ? met.cvssData.baseScore : null;
    const sev = met ? (met.cvssData.baseSeverity || met.baseSeverity || null) : null;
    const d = (c.descriptions||[]).filter(x => x.lang==='en')[0];
    return { 
      id:c.id, published:c.published, status:c.vulnStatus,
      desc: d ? d.value : 'No description.', score:score, sev: sev ? sev.toUpperCase() : null, kws:[kw] 
    };
  }

  async function fetchKeyword(kw, start, end){
    const url = 'https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=' + encodeURIComponent(kw) +
      '&pubStartDate=' + start + '&pubEndDate=' + end + '&resultsPerPage=2000';
    for(let attempt = 0; attempt < 2; attempt++){
      const res = await fetch(url);
      if(res.ok) return res.json();
      if((res.status === 403 || res.status === 429) && attempt === 0){ await sleep(7000); continue; }
      throw new Error(`NVD answered ${res.status} for "${kw}"` +
        (res.status === 403 || res.status === 429 ? ' (rate limit, wait 30 seconds and retry)' : ''));
    }
  }

  async function updateVulnerabilities(){
    const active = KEYWORDS.filter(o => o.on).map(o => o.k);
    if(!active.length){ setVulnStatus('Select at least one product.', true); return; }
    const btn = $('vulnUpdate');
    btn.disabled = true;
    // btn.textContent = 'Updating…';
    // btn.classList.add('loading');
    startLoading(btn);
    const end = new Date(), start = new Date(end.getTime() - DAYS*864e5);
    const map = {};
    try{
      for(let i = 0; i < active.length; i++){
        setVulnStatus(`Fetching ${active[i]} (${i+1} of ${active.length})…`);
        const json = await fetchKeyword(active[i], start.toISOString(), end.toISOString());
        (json.vulnerabilities || []).forEach(v => {
          const p = parseVuln(v, active[i]);
          if(p.status === 'Rejected' || /^\*\* REJECT/.test(p.desc)) return;
          if(map[p.id]) map[p.id].kws.push(active[i]); 
          else map[p.id] = p;
        });
        if(i < active.length - 1) await sleep(1200);
      }
      vulnData.data = Object.keys(map).map(k => map[k]);
      vulnData.fetchedAt = new Date().toISOString();
      save(CACHE_VULN, vulnData);
      renderVulnerabilities();
    }catch(e){
      setVulnStatus(`Update failed: ${e.message}. Showing last saved data if any.`, true);
    }finally{
      btn.disabled = false;
      stopLoading(btn);
      // btn.classList.remove('loading');
      // btn.textContent = 'Update vulnerabilities';
    }
  }

  function renderVulnerabilities(){
    const q = $('vulnQ').value.trim().toLowerCase();
    const sevF = $('vulnSev').value;
    const sort = $('vulnSort').value;
    const rank = {CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1};
    const min = sevF === 'all' ? 0 : rank[sevF];
    
    let list = vulnData.data.filter(v => {
      if(min && (rank[v.sev]||0) < min) return false;
      if(q && (v.id + ' ' + v.desc + ' ' + v.kws.join(' ')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    
    list.sort((a,b) => {
      if(sort === 'score'){ const d = (b.score||-1) - (a.score||-1); if(d) return d; }
      return new Date(b.published) - new Date(a.published);
    });

    const counts = {CRITICAL:0,HIGH:0,MEDIUM:0,LOW:0,NA:0};
    list.forEach(v => { counts[v.sev || 'NA']++; });
    const total = list.length || 1;
    const bar = ['CRITICAL','HIGH','MEDIUM','LOW','NA'].map(s =>
      `<i style="width:${counts[s]/total*100}%;background:${sevColor(s)}"></i>`
    ).join('');
    
    $('vulnSummary').innerHTML = vulnData.data.length ?
      `<div class="bar" aria-hidden="true">${bar}</div><div class="legend">` +
      ['CRITICAL','HIGH','MEDIUM','LOW','NA'].map(s =>
        `<span style="--c:${sevColor(s)}">${counts[s]} ${sevLabel(s).toLowerCase()}</span>`
      ).join('') + '</div>' : '';

    if(vulnData.fetchedAt){
      setVulnStatus(list.length + ' of ' + vulnData.data.length + ' vulnerabilities shown. Last updated ' +
        new Date(vulnData.fetchedAt).toLocaleString() + '.');
    }

    if(!vulnData.data.length){
      $('vulnLog').innerHTML = '<div class="empty">No data yet. Select products and click Update vulnerabilities.</div>';
      return;
    }
    if(!list.length){
      $('vulnLog').innerHTML = '<div class="empty">Nothing matches these filters.</div>';
      return;
    }

    let html = '', lastDay = '';
    list.forEach(v => {
      if(sort === 'date'){
        const day = new Date(v.published).toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
        if(day !== lastDay){ html += `<div class="day">${esc(day)}</div>`; lastDay = day; }
      }
      const col = sevColor(v.sev);
      html += `<article class="item" style="--c:${col};border-left-color:${col}">` +
        `` +
        `<div><h3>
        <div class="score">${v.score != null ? v.score.toFixed(1) : '–'}<small>${sevLabel(v.sev)}</small></div>
        <a href="https://nvd.nist.gov/vuln/detail/${encodeURIComponent(v.id)}" target="_blank" rel="noopener">${esc(v.id)}</a>
        <div class="tags">` +
        v.kws.map(k => `<span class="tag">${esc(k)}</span>`).join('') +
        (sort === 'score' ? `<span class="tag">${esc(new Date(v.published).toLocaleDateString())}</span>` : '') +
        `</div></h3><p class="desc" title="Click to expand">${esc(v.desc)}</p></div></article>`;

        /*html += `<article class="item" style="--c:${col};border-left-color:${col}">` +
  `<div class="score">${v.score != null ? v.score.toFixed(1) : '–'}<small>${sevLabel(v.sev)}</small></div>` +
  `<div><h3>
    <a href="https://nvd.nist.gov/vuln/detail/${encodeURIComponent(v.id)}" target="_blank" rel="noopener">${esc(v.id)}</a>
    <div class="tags">` +
      v.kws.map(k => `<span class="tag">${esc(k)}</span>`).join('') +
      (sort === 'score' ? `<span class="tag">${esc(new Date(v.published).toLocaleDateString())}</span>` : '') +
    `</div>
  </h3><p class="desc" title="Click to expand">${esc(v.desc)}</p></div></article>`;*/
    });
    $('vulnLog').innerHTML = html;
  }

  $('vulnUpdate').addEventListener('click', updateVulnerabilities);
  $('vulnQ').addEventListener('input', renderVulnerabilities);
  $('vulnSev').addEventListener('change', renderVulnerabilities);
  $('vulnSort').addEventListener('change', renderVulnerabilities);
  // $('vulnLog').addEventListener('click', e => {
  //   if(e.target.classList.contains('desc') || e.target.classList.contains('item')) e.target.classList.toggle('open');
  // });

  $('vulnLog').addEventListener('click', e => {
    if (e.target.closest('a')) return;

    const item = e.target.closest('.item');
    if (item) item.classList.toggle('open');
  });

  /* ========== CHANGELOG SECTION ========== */

  function setChangeStatus(msg){
    $('changeStatus').textContent = msg;
  }

  async function fetchJson(path, bust) {
    const url = bust ? `${path}?t=${Date.now()}` : path;
    const response = await fetch(url, { cache: bust ? "no-store" : "default" });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }

  /*async function loadChangelog(bust = false) {
    const btn = $('changeRefresh');
    // btn.classList.add('loading');
    startLoading(btn);
    setChangeStatus("Loading…");
    const keys = Object.keys(SOURCES);
    const results = await Promise.allSettled([
      ...keys.map(key => fetchJson(SOURCES[key], bust)),
      fetchJson(META_PATH, bust),
    ]);

    const errors = [];
    keys.forEach((key, index) => {
      const result = results[index];
      if (result.status === "fulfilled") {
        changeData.data[key] = result.value;
        changeData.data[key].releases.sort((a, b) => b.date.localeCompare(a.date));
      } else {
        errors.push(result.reason.message);
      }
    });

    const metaResult = results[keys.length];
    changeData.meta = metaResult.status === "fulfilled" ? metaResult.value : null;
    
    save(CACHE_CHANGE, changeData);
    renderChangelog();
    // btn.classList.remove('loading');
    stopLoading(btn);
    if (errors.length) setChangeStatus(`Some data could not be loaded: ${errors.join("; ")}`);
  }*/


    async function loadChangelog(bust = false) {
  const btn = $('changeRefresh');
  startLoading(btn);
  setChangeStatus("Loading…");

  try {
    const keys = Object.keys(SOURCES);
    const results = await Promise.allSettled([
      ...keys.map(key => fetchJson(SOURCES[key], bust)),
      fetchJson(META_PATH, bust),
    ]);

    const errors = [];
    keys.forEach((key, index) => {
      const result = results[index];
      if (result.status === "fulfilled") {
        changeData.data[key] = result.value;
        changeData.data[key].releases.sort((a, b) => b.date.localeCompare(a.date));
      } else {
        errors.push(result.reason.message);
      }
    });

    const metaResult = results[keys.length];
    changeData.meta = metaResult.status === "fulfilled" ? metaResult.value : null;

    save(CACHE_CHANGE, changeData);
    renderChangelog();

    if (errors.length) setChangeStatus(`Some data could not be loaded: ${errors.join("; ")}`);
  } catch (e) {
    setChangeStatus(`Update failed: ${e.message}`);
  } finally {
    stopLoading(btn);
  }
}

  function visibleChangelogEntries() {
    const product = $('changeProduct').value;
    const keys = product === 'all' ? Object.keys(changeData.data) : [product];
    const query = $('changeSearch').value.trim().toLowerCase();
    const from = $('changeFrom').value;
    const to = $('changeTo').value;
    const types = new Set();
    document.querySelectorAll('input[name=type]:checked').forEach(box => types.add(box.value));

    const entries = [];
    for (const key of keys) {
      const dataset = changeData.data[key];
      if (!dataset) continue;
      dataset.releases.forEach((release, index) => {
        if (from && release.date < from) return;
        if (to && release.date > to) return;

        const versionMatches = !query || release.version.toLowerCase().includes(query);
        const items = (release.items || []).filter(
          item =>
            types.has(item.type) &&
            (!query || versionMatches || item.text.toLowerCase().includes(query))
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

  function renderChangelogCard({ product, release, items, latest }) {
    const groups = Object.keys(TYPE_LABELS).map(type => {
      const texts = items.filter(item => item.type === type).map(item => item.text);
      if (!texts.length) return null;
      return `<section class="change-group"><h4 class="${type}">${TYPE_LABELS[type]}</h4><ul>` +
        texts.map(text => `<li>${esc(text)}</li>`).join('') +
        '</ul></section>';
    }).filter(Boolean);

    const files = release.files?.length
      ? `<details class="files"><summary>Files changed (${release.files.length})</summary><ul>` +
        release.files.map(file => `<li>${esc(file)}</li>`).join('') +
        '</ul></details>'
      : '';

    const count = items.length;
    return `<li class="release-item">
      <details>
        <summary>
          <span class="badge product">${esc(product)}</span>
          <span class="version">${esc(release.version)}</span>
          <time class="date" datetime="${release.date}">${formatDate(release.date)}</time>
          ${latest ? '<span class="badge latest">Latest</span>' : ''}
          <span class="count">${count} change${count === 1 ? '' : 's'}</span>
        </summary>
        ${groups.join('')}
        ${files}
      </details>
    </li>`;
  }

  function renderChangelog() {
    const entries = visibleChangelogEntries();
    const list = $('changeLog');
    list.innerHTML = entries.map(renderChangelogCard).join('');
    if (!Object.keys(changeData.data).length) return;
    setChangeStatus(entries.length 
      ? `${entries.length} release${entries.length === 1 ? '' : 's'} shown`
      : "No releases match your filters.");
  }

  function syncChangelogControls() {
    const product = $('changeLog').value;
    $('changeSearch').value = '';
    $('changeFrom').value = '';
    $('changeTo').value = '';
    document.querySelectorAll('input[name=type]').forEach(box => { box.checked = true; });
  }

  $('changeProduct').addEventListener('change', () => { syncChangelogControls(); renderChangelog(); });
  $('changeSearch').addEventListener('input', renderChangelog);
  $('changeFrom').addEventListener('change', renderChangelog);
  $('changeTo').addEventListener('change', renderChangelog);
  document.querySelectorAll('#changeTypes input[name=type]').forEach(box => {
    box.addEventListener('change', renderChangelog);
  });

  $('changeReset').addEventListener('click', () => {
    syncChangelogControls();
    renderChangelog();
  });

  $('changeRefresh').addEventListener('click', () => loadChangelog(true));
  

  
    const showDiviFilters = document.querySelector('#showDiviFilters');
    if (showDiviFilters) {
      showDiviFilters.addEventListener('click', function() {
        this.classList.toggle('active');
        document.querySelector('.diviFilters')?.classList.toggle('active');
      });
    }
    
    const showVulnFilters = document.querySelector('#showVulnFilters');
    if (showVulnFilters) {
      showVulnFilters.addEventListener('click', function() {
        this.classList.toggle('active');
        document.querySelector('.vulnFilters')?.classList.toggle('active');
      });
    }
  

  /* ========== INITIALIZATION ========== */
  
  // Load vulnerabilities
  const cachedVuln = load(CACHE_VULN);
  if(cachedVuln && cachedVuln.data){ 
    vulnData.data = cachedVuln.data; 
    vulnData.fetchedAt = cachedVuln.fetchedAt; 
    renderVulnerabilities(); 
  } else { 
    renderVulnerabilities(); 
    setVulnStatus('Click Update vulnerabilities to load the last 30 days.');
  }

  // Load changelog
  const cachedChange = load(CACHE_CHANGE);
  if(cachedChange && cachedChange.data){
    changeData.data = cachedChange.data;
    changeData.meta = cachedChange.meta;
    renderChangelog();
  } else {
    loadChangelog();
  }
})();
