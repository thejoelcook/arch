// Arch command bar: one search box over open tabs, pinned tabs, actions, bookmarks, history and the archive.
// Opens as a small centered window; ?win=<id> is the browser window it acts on.

const WIN = Number(new URLSearchParams(location.search).get('win')) || null;
const qEl = document.getElementById('q');
const listEl = document.getElementById('results');

const ICON = {
  globe: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c1.8 2 1.8 10 0 12M8 2c-1.8 2-1.8 10 0 12"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
  bolt: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M9 1.5L3.5 9H8l-1 5.5L12.5 7H8z"/></svg>',
};

const h = (tag, props = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return el;
};

let ICONS = {};
chrome.storage.local.get('icons').then((r) => { ICONS = r.icons || {}; }).catch(() => {});
function favicon(pageUrl) {
  const saved = pageUrl && ICONS[pageUrl.split('#')[0]];
  if (saved) return saved;
  const u = new URL(chrome.runtime.getURL('/_favicon/'));
  u.searchParams.set('pageUrl', pageUrl || 'about:blank');
  u.searchParams.set('size', '32');
  return u.toString();
}
function shortUrl(url) {
  try { const u = new URL(url); return /^https?:$/.test(u.protocol) ? u.host.replace(/^www\./, '') + (u.pathname === '/' ? '' : u.pathname) : url; } catch (_) { return url || ''; }
}
function looksLikeUrl(text) {
  return /^[a-z]+:\/\//i.test(text) || /^localhost(:\d+)?(\/|$)/i.test(text)
    || (!/\s/.test(text) && /^[^\s]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(text));
}
const send = (type, payload = {}) => chrome.runtime.sendMessage({ type, windowId: WIN, ...payload });
const done = () => window.close();

// ---------- data ----------

const D = { tabs: [], spaces: [], archive: [], pinnedTabs: {}, activeSpaceId: null, activeTab: null };

async function load() {
  const [tabs, l, ss] = await Promise.all([
    chrome.tabs.query({ windowType: 'normal' }),
    chrome.storage.local.get(['spaces', 'archive']),
    chrome.storage.session.get(['pinnedTabs', 'activeSpace']),
  ]);
  D.tabs = tabs;
  D.spaces = l.spaces || [];
  D.archive = l.archive || [];
  D.pinnedTabs = ss.pinnedTabs || {};
  D.activeSpaceId = (ss.activeSpace || {})[WIN] || (D.spaces[0] && D.spaces[0].id);
  D.activeTab = tabs.find((t) => t.active && t.windowId === WIN) || null;
}

function pinnedItems() {
  const out = [];
  const walk = (items, space, path) => {
    for (const it of items || []) {
      if (it.type === 'folder') walk(it.children, space, [...path, it.title]);
      else out.push({ item: it, space, path });
    }
  };
  D.spaces.forEach((s) => walk(s.items, s, []));
  return out;
}

const spaceLabel = (s) => (s ? `${s.emoji ? s.emoji + ' ' : ''}${s.name}` : '');

function actions() {
  const t = D.activeTab;
  const muted = !!(t && t.mutedInfo && t.mutedInfo.muted);
  const list = [];
  if (t && t.url) {
    list.push({ title: 'Copy URL', keys: 'copy link url', run: async () => { await navigator.clipboard.writeText(t.url); done(); } });
    if (t.audible || muted) list.push({ title: muted ? 'Unmute tab' : 'Mute tab', keys: 'mute unmute sound audio', run: () => chrome.tabs.update(t.id, { muted: !muted }).then(done) });
    if (!t.pinned) list.push({ title: 'Add tab to Favorites', keys: 'favorite favourites pin', run: () => chrome.tabs.update(t.id, { pinned: true }).then(done) });
    list.push({ title: 'Reload tab', keys: 'refresh reload', run: () => chrome.tabs.reload(t.id).then(done) });
    list.push({ title: 'Duplicate tab', keys: 'duplicate copy tab', run: () => chrome.tabs.duplicate(t.id).then(done) });
    list.push({ title: 'Close tab', keys: 'close tab', run: () => chrome.tabs.remove(t.id).then(done) });
  }
  list.push({ title: 'New tab', keys: 'new tab open', run: () => send('newTab').then(done) });
  if (D.activeSpaceId) list.push({ title: 'Archive today’s tabs', keys: 'archive clear today tidy', run: () => send('clearToday', { spaceId: D.activeSpaceId }).then(done) });
  for (const s of D.spaces) {
    if (s.id === D.activeSpaceId) continue;
    list.push({ title: `Switch to ${spaceLabel(s)}`, keys: `space switch go ${s.name}`, run: () => send('switchSpace', { spaceId: s.id }).then(done) });
  }
  return list;
}

// ---------- matching ----------

function matches(words, ...fields) {
  const hay = fields.filter(Boolean).join(' ').toLowerCase();
  return words.every((w) => hay.includes(w));
}
function score(words, title, url) {
  const t = (title || '').toLowerCase();
  let s = 0;
  for (const w of words) {
    if (t.startsWith(w)) s += 3;
    else if (t.includes(' ' + w)) s += 2;
    else if (t.includes(w)) s += 1;
    if ((url || '').toLowerCase().includes(w)) s += 0.5;
  }
  return s;
}

// ---------- results ----------

let rows = [];
let sel = 0;

function row({ icon, img, title, meta, tag, run, rank = 0 }) {
  return { icon, img, title, meta, tag, run, rank };
}

async function build(query) {
  const q = query.trim();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const sections = [];
  const seen = new Set();
  const norm = (u) => (u || '').split('#')[0].replace(/\/$/, '');

  if (q) {
    if (looksLikeUrl(q)) {
      const url = /^[a-z]+:\/\//i.test(q) ? q : (/^localhost/i.test(q) ? 'http://' : 'https://') + q;
      sections.push(['', [row({ icon: ICON.globe, title: `Open ${q}`, run: () => chrome.tabs.create({ windowId: WIN, url }).then(done) })]]);
    } else {
      sections.push(['', [row({
        icon: ICON.search, title: `Search for “${q}”`,
        run: async () => { const t = await chrome.tabs.create({ windowId: WIN }); await chrome.search.query({ text: q, tabId: t.id }); done(); },
      })]]);
    }
  }

  // Open tabs (not Arch's own pages), most recently used first.
  const tabs = D.tabs.filter((t) => !(t.url || '').startsWith(chrome.runtime.getURL('')) && (!q || matches(words, t.title, t.url)))
    .filter((t) => q || !(t.active && t.windowId === WIN))
    .sort((a, b) => (q ? score(words, b.title, b.url) - score(words, a.title, a.url) : 0) || (b.lastAccessed || 0) - (a.lastAccessed || 0))
    .slice(0, q ? 8 : 6);
  tabs.forEach((t) => seen.add(norm(t.url)));
  if (tabs.length) {
    sections.push([q ? 'Open tabs' : 'Recent tabs', tabs.map((t) => row({
      img: t.favIconUrl && /^(https?|data):/.test(t.favIconUrl) ? t.favIconUrl : favicon(t.url),
      title: t.title || shortUrl(t.url), meta: shortUrl(t.url), tag: t.pinned ? 'Favorite' : null, rank: q ? score(words, t.title, '') : 0,
      run: async () => { await chrome.tabs.update(t.id, { active: true }); await chrome.windows.update(t.windowId, { focused: true }); done(); },
    }))]);
  }

  if (q) {
    const pins = pinnedItems().filter(({ item, path }) => matches(words, item.title, item.url, path.join(' ')) && !seen.has(norm(item.url)))
      .sort((a, b) => score(words, b.item.title, b.item.url) - score(words, a.item.title, a.item.url)).slice(0, 6);
    pins.forEach(({ item }) => seen.add(norm(item.url)));
    if (pins.length) {
      sections.push(['Pinned', pins.map(({ item, space, path }) => row({
        img: favicon(item.url), title: item.title, rank: score(words, item.title, ''),
        meta: [spaceLabel(space), ...path].join(' › '),
        run: () => send('openItem', { itemId: item.id }).then(done),
      }))]);
    }
  }

  const acts = actions().filter((a) => !q || matches(words, a.title, a.keys)).slice(0, q ? 5 : 4);
  if (acts.length) sections.push(['Actions', acts.map((a) => row({ icon: ICON.bolt, title: a.title, run: a.run }))]);

  if (q) {
    const [marks, hist] = await Promise.all([
      chrome.bookmarks ? chrome.bookmarks.search(q).catch(() => []) : [],
      chrome.history ? chrome.history.search({ text: q, maxResults: 25, startTime: 0 }).catch(() => []) : [],
    ]);
    const bm = marks.filter((b) => b.url && !seen.has(norm(b.url))).slice(0, 5);
    bm.forEach((b) => seen.add(norm(b.url)));
    if (bm.length) sections.push(['Bookmarks', bm.map((b) => row({ img: favicon(b.url), title: b.title || shortUrl(b.url), meta: shortUrl(b.url), run: () => chrome.tabs.create({ windowId: WIN, url: b.url }).then(done) }))]);

    const hs = hist.filter((x) => x.url && !seen.has(norm(x.url)) && !x.url.startsWith('chrome-extension://'))
      .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0)).slice(0, 6);
    hs.forEach((x) => seen.add(norm(x.url)));
    if (hs.length) sections.push(['History', hs.map((x) => row({ img: favicon(x.url), title: x.title || shortUrl(x.url), meta: shortUrl(x.url), run: () => chrome.tabs.create({ windowId: WIN, url: x.url }).then(done) }))]);

    if (!chrome.history || !chrome.bookmarks) {
      sections.push(['', [row({
        icon: ICON.search, title: 'Also search your history and bookmarks\u2026',
        run: async () => { const ok = await chrome.permissions.request({ permissions: ['history', 'bookmarks'] }).catch(() => false); if (ok) refresh(); },
      })]]);
    }
    const ar = D.archive.filter((r) => matches(words, r.title, r.url) && !seen.has(norm(r.url))).slice(0, 5);
    if (ar.length) sections.push(['Archive', ar.map((r) => row({ img: favicon(r.url), title: r.title, meta: shortUrl(r.url), tag: 'Archived', run: () => send('restoreArchived', { id: r.id }).then(done) }))]);
  }
  // A tab or pin whose title starts with what you typed beats the generic search row, like Arc.
  if (q && !looksLikeUrl(q) && sections.length > 1) {
    let best = null;
    for (const [label, items] of sections.slice(1)) {
      if (label !== 'Open tabs' && label !== 'Pinned') continue;
      for (const r of items) if (r.rank >= 3 * words.length && (!best || r.rank > best.rank)) best = r;
    }
    if (best) {
      for (const sec of sections) sec[1] = sec[1].filter((r) => r !== best);
      sections.unshift(['Top hit', [best]]);
    }
  }
  return sections.filter(([, items]) => items.length);
}

let buildId = 0;
async function refresh() {
  const id = ++buildId;
  const sections = await build(qEl.value);
  if (id !== buildId) return; // a newer keystroke won
  rows = [];
  listEl.innerHTML = '';
  for (const [label, items] of sections) {
    if (label) listEl.append(h('div', { class: 'section' }, label));
    for (const r of items) {
      const i = rows.length;
      rows.push(r);
      listEl.append(h('div', {
        class: 'item', 'data-i': String(i), role: 'option',
        onmousemove: () => { if (sel !== i) { sel = i; paint(); } },
        onclick: () => r.run(),
      },
      h('span', { class: 'ic', html: r.icon || null }, r.img ? h('img', { src: r.img, alt: '' }) : null),
      h('span', { class: 't' }, r.title),
      r.tag ? h('span', { class: 'tag' }, r.tag) : null,
      r.meta ? h('span', { class: 'meta' }, r.meta) : null));
    }
  }
  if (!rows.length) listEl.append(h('div', { class: 'empty' }, 'Nothing found'));
  sel = 0;
  paint();
}

function paint() {
  listEl.querySelectorAll('.item').forEach((el) => el.classList.toggle('sel', Number(el.dataset.i) === sel));
  const el = listEl.querySelector('.item.sel');
  if (el) el.scrollIntoView({ block: 'nearest' });
}

qEl.addEventListener('input', refresh);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.preventDefault(); done(); }
  else if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'n')) { e.preventDefault(); if (rows.length) { sel = (sel + 1) % rows.length; paint(); } }
  else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'p')) { e.preventDefault(); if (rows.length) { sel = (sel - 1 + rows.length) % rows.length; paint(); } }
  else if (e.key === 'Enter') { e.preventDefault(); if (rows[sel]) rows[sel].run(); }
});
// Like Arc, the bar goes away when you click back into the browser.
window.addEventListener('blur', () => setTimeout(() => { if (!document.hasFocus()) done(); }, 120));

(async () => {
  await load();
  await refresh();
  qEl.focus();
})();
