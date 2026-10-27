// Arch sidebar UI.

const COLORS = {
  blue: '#1a73e8', purple: '#a142f4', pink: '#d01884', red: '#d93025', orange: '#fa903e',
  yellow: '#f9ab00', green: '#188038', cyan: '#007b83', grey: '#5f6368',
};
const ARCHIVE_OPTIONS = [
  [6, 'After 6 hours'], [12, 'After 12 hours'], [24, 'After 1 day'],
  [168, 'After 7 days'], [720, 'After 30 days'], [0, 'Never'],
];

const ICON = {
  x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>',
  dots: '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="12.5" cy="8" r="1.3"/></svg>',
  chev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>',
  folder: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2 4.5a1 1 0 011-1h3.2l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1z"/></svg>',
  archive: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="2" y="3" width="12" height="3" rx="0.8"/><path d="M3 6v6.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V6M6.5 8.5h3"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>',
  folderOpen: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2 12.5V4a1 1 0 011-1h3l1.5 1.5H12a1 1 0 011 1V7"/><path d="M2 12.5L3.6 7.6a1 1 0 01.95-.7H14a.6.6 0 01.57.78L13.2 12a1 1 0 01-.95.7H2.2"/></svg>',
  navBack: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8H3.5M7.5 4L3.5 8l4 4"/></svg>',
  navFwd: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h9.5M8.5 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8a5 5 0 11-1.6-3.7M13 2.5v3h-3"/></svg>',
  library: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2.5" y="5" width="11" height="8.5" rx="1.5"/><path d="M4.5 5V3.5h7V5M6.5 8.5h3"/></svg>',
  clear: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v9M4.5 8.5L8 12l3.5-3.5"/></svg>',
  tidy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10M3 8h7M3 12h4"/><path d="M12.5 9.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="currentColor" stroke-width="0.8"/></svg>',
  link: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6.8 9.2a3 3 0 004.2 0l2-2a3 3 0 00-4.2-4.2l-.9.9"/><path d="M9.2 6.8a3 3 0 00-4.2 0l-2 2a3 3 0 004.2 4.2l.9-.9"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>',
  shot: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 5.5v-2a1 1 0 011-1h2M10.5 2.5h2a1 1 0 011 1v2M13.5 10.5v2a1 1 0 01-1 1h-2M5.5 13.5h-2a1 1 0 01-1-1v-2"/><path d="M5.5 6h5M5.5 8h5M5.5 10h3"/></svg>',
  share: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10V2.5M5.5 5L8 2.5 10.5 5"/><path d="M5 7.5H4a1 1 0 00-1 1v4.5a1 1 0 001 1h8a1 1 0 001-1V8.5a1 1 0 00-1-1h-1"/></svg>',
  muted: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2.5 6h2.5l3-2.5v9L5 10H2.5z"/><path d="M10.5 6.2l3.3 3.6M13.8 6.2l-3.3 3.6" stroke-linecap="round"/></svg>',
  audio: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2.5 6h2.5l3-2.5v9L5 10H2.5z"/><path d="M10.5 5.5a3.5 3.5 0 010 5M12.3 3.8a6 6 0 010 8.4" stroke-linecap="round"/></svg>',
};

const S = {
  windowId: null,
  spaces: [], archive: [], settings: { archiveAfterHours: 12, autoPip: true, tintBackground: false, panelBg: '#f9f9ff', panelBgDark: '#1f1f23' },
  pinnedTabs: {}, activeSpace: {}, groupIds: {},
  tabs: [], groups: [],
  view: 'main', archiveQuery: '',
  renaming: null, renameValue: '',
  selected: new Set(), anchor: null, order: [],
};

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const sameUrl = (a, b) => !!a && !!b && a.split('#')[0].replace(/\/$/, '') === b.split('#')[0].replace(/\/$/, '');
// Arc-style pastel space colors. Each maps to the closest Chrome tab group color.
const TINTS = [
  ['#a98bd6', 'purple'], ['#8fa3dc', 'blue'], ['#7fb6d8', 'cyan'], ['#78b8aa', 'green'],
  ['#9cc283', 'green'], ['#d6be6e', 'yellow'], ['#e2a477', 'orange'], ['#df92b8', 'pink'],
  ['#dd8a8a', 'red'], ['#a6a3ab', 'grey'],
];
const tintOf = (space) => (space && space.tint)
  || ((TINTS.find(([, g]) => g === (space && space.color)) || TINTS[0])[0]);
function shortUrl(url) {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return url;
    return (u.host.replace(/^www\./, '') + (u.pathname === '/' ? '' : u.pathname)).replace(/\/$/, '');
  } catch (_) { return url || ''; }
}
const groupTitle = (s) => (s.emoji ? `${s.emoji} ${s.name}` : s.name);
const send = (type, payload = {}) => chrome.runtime.sendMessage({ type, windowId: S.windowId, ...payload });

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

function faviconFor(pageUrl, tabIcon) {
  if (tabIcon && /^(https?:|data:)/.test(tabIcon)) return tabIcon;
  const saved = S.icons && pageUrl && S.icons[pageUrl.split('#')[0]];
  if (saved) return saved;
  const u = new URL(chrome.runtime.getURL('/_favicon/'));
  u.searchParams.set('pageUrl', pageUrl || 'about:blank');
  u.searchParams.set('size', '32');
  return u.toString();
}
const favImg = (pageUrl, tabIcon) => h('img', { class: 'fi', src: faviconFor(pageUrl, tabIcon), alt: '' });

// ---------- optional permissions ----------
// The downloads tray asks for permission the first time you use it, so installing Arch
// doesn't show a long list of warnings. (debugger can't be optional in Chrome, so it's required.)
const PERMS = { debugger: true, downloads: false };
async function loadPerms() {
  PERMS.debugger = await chrome.permissions.contains({ permissions: ['debugger'] });
  PERMS.downloads = await chrome.permissions.contains({ permissions: ['downloads', 'downloads.open'] });
}
chrome.permissions.onAdded.addListener(() => loadPerms().then(() => { if (PERMS.downloads) dlInit(); }));
chrome.permissions.onRemoved.addListener(loadPerms);

// The welcome page can ask an open sidebar to show the Arc import dialog.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.type !== 'showArcImport') return false;
  S.view = 'settings';
  render();
  arcImportDialog();
  sendResponse({ shown: true });
  return false;
});

// ---------- tree helpers ----------

function locate(items, id, parent = null) {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.id === id) return { list: items, index: i, item: it, parent };
    if (it.type === 'folder') {
      const r = locate(it.children, id, it);
      if (r) return r;
    }
  }
  return null;
}
const contains = (folder, id) => folder.children.some((c) => c.id === id || (c.type === 'folder' && contains(c, id)));
function linkIds(items, out = []) {
  for (const it of items) it.type === 'folder' ? linkIds(it.children, out) : out.push(it.id);
  return out;
}
function insertAt(items, item, target) {
  const loc = target && target.id ? locate(items, target.id) : null;
  if (!loc) return items.push(item);
  if (target.pos === 'into') {
    loc.item.children.push(item);
    loc.item.open = true;
  } else {
    loc.list.splice(loc.index + (target.pos === 'after' ? 1 : 0), 0, item);
  }
}

async function mutateSpaces(fn) {
  const { spaces = [] } = await chrome.storage.local.get('spaces');
  const res = fn(spaces);
  await chrome.storage.local.set({ spaces });
  return res;
}
async function mutateSpace(spaceId, fn) {
  return mutateSpaces((spaces) => {
    const s = spaces.find((x) => x.id === spaceId);
    return s ? fn(s) : undefined;
  });
}

// ---------- state ----------

async function load() {
  const [l, ss, allTabs, allGroups] = await Promise.all([
    chrome.storage.local.get(['spaces', 'archive', 'settings', 'syncStatus', 'icons', 'favorites']),
    chrome.storage.session.get(['pinnedTabs', 'activeSpace', 'groupIds', 'favTabs']),
    chrome.tabs.query({ windowType: 'normal' }),
    chrome.tabGroups.query({}),
  ]);
  const tabs = allTabs.filter((t) => t.windowId === S.windowId);
  const groups = allGroups.filter((g) => g.windowId === S.windowId);
  S.otherTabs = allTabs.filter((t) => t.windowId !== S.windowId && !t.pinned && t.groupId !== -1);
  S.otherGroups = allGroups.filter((g) => g.windowId !== S.windowId);
  S.favorites = l.favorites || null;
  S.favTabs = ss.favTabs || {};
  S.spaces = l.spaces || [];
  S.archive = l.archive || [];
  S.syncStatus = l.syncStatus || null;
  S.icons = l.icons || {};
  S.settings = { archiveAfterHours: 12, autoPip: true, tintBackground: false, panelBg: '#f9f9ff', panelBgDark: '#1f1f23', ...(l.settings || {}) };
  S.pinnedTabs = ss.pinnedTabs || {};
  S.activeSpace = ss.activeSpace || {};
  S.groupIds = ss.groupIds || {};
  S.tabs = tabs.sort((a, b) => a.index - b.index);
  S.groups = groups;
}

function groupIdFor(space) {
  if (!space) return null;
  const gid = S.groupIds[`${S.windowId}:${space.id}`];
  if (gid != null && S.groups.some((g) => g.id === gid)) return gid;
  const g = S.groups.find((x) => x.title === groupTitle(space));
  return g ? g.id : null;
}

function currentSpace() {
  const byId = S.spaces.find((s) => s.id === S.activeSpace[S.windowId]);
  if (byId) return byId;
  const active = S.tabs.find((t) => t.active);
  if (active && active.groupId !== -1) {
    const s = S.spaces.find((x) => groupIdFor(x) === active.groupId);
    if (s) return s;
  }
  return S.spaces[0] || null;
}

const tabById = (id) => S.tabs.find((t) => t.id === id);
const activeTabId = () => (S.tabs.find((t) => t.active) || {}).id;
const pinnedTabSet = () => new Set(Object.values(S.pinnedTabs));

// ---------- drag and drop ----------

let drag = null;
let pendingRender = false;

function clearDropMarks() {
  document.querySelectorAll('.drop-before,.drop-after,.drop-into,.drop-left,.drop-right,.hot').forEach((el) =>
    el.classList.remove('drop-before', 'drop-after', 'drop-into', 'drop-left', 'drop-right', 'hot')
  );
}

function makeDraggable(el, payload, dragUrl) {
  el.draggable = true;
  el.addEventListener('dragstart', (e) => {
    drag = payload;
    e.dataTransfer.effectAllowed = 'move';
    if (dragUrl) e.dataTransfer.setData('text/uri-list', dragUrl);
    e.dataTransfer.setData('text/plain', dragUrl || '');
    requestAnimationFrame(() => el.classList.add('dragging'));
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    drag = null;
    clearDropMarks();
    if (pendingRender) { pendingRender = false; refresh(); }
  });
}

// Today's tabs: drag a tab above or below another to reorder, or drop a pinned item between
// tabs to unpin it right there. The list follows Chrome's tab order inside the space's group.
function makeTabDropTarget(el, tab) {
  const posFor = (e) => { const r = el.getBoundingClientRect(); return e.clientY < r.top + r.height / 2 ? 'before' : 'after'; };
  const accepts = (d) => d && ((d.kind === 'tab' && !d.fav && d.tabId !== tab.id) || d.kind === 'item');
  el.addEventListener('dragover', (e) => {
    if (!accepts(drag)) return;
    e.preventDefault();
    e.stopPropagation();
    clearDropMarks();
    el.classList.add(`drop-${posFor(e)}`);
  });
  el.addEventListener('dragleave', () => el.classList.remove('drop-before', 'drop-after'));
  el.addEventListener('drop', async (e) => {
    if (!accepts(drag)) return;
    e.preventDefault();
    e.stopPropagation();
    const d = drag; const pos = posFor(e);
    drag = null;
    clearDropMarks();
    let movingId = d.tabId;
    if (d.kind === 'item') {
      movingId = S.pinnedTabs[d.id];
      await unpinItem(d.id);
      if (movingId == null) return;
    }
    await moveTabNextTo(Number(movingId), tab.id, pos);
  });
}

async function moveTabNextTo(tabId, targetId, pos) {
  const [moving, target] = await Promise.all([chrome.tabs.get(tabId).catch(() => null), chrome.tabs.get(targetId).catch(() => null)]);
  if (!moving || !target || moving.windowId !== target.windowId) return;
  let index = pos === 'before' ? target.index : target.index + 1;
  if (moving.index < index) index -= 1;
  if (moving.index !== index) await chrome.tabs.move(tabId, { index }).catch(() => {});
  // Moving to the edge of a group can drop a tab out of it; keep it in the target's space.
  const moved = await chrome.tabs.get(tabId).catch(() => null);
  if (moved && target.groupId !== -1 && moved.groupId !== target.groupId) {
    await chrome.tabs.group({ groupId: target.groupId, tabIds: [tabId] }).catch(() => {});
  }
}

function makeItemDropTarget(el, item) {
  const posFor = (e) => {
    const r = el.getBoundingClientRect();
    const y = (e.clientY - r.top) / r.height;
    if (item.type === 'folder') return y < 0.28 ? 'before' : y > 0.72 ? 'after' : 'into';
    return y < 0.5 ? 'before' : 'after';
  };
  el.addEventListener('dragover', (e) => {
    if (!drag) return;
    if (drag.kind === 'item' && drag.id === item.id) return;
    e.preventDefault();
    e.stopPropagation();
    clearDropMarks();
    el.classList.add(`drop-${posFor(e)}`);
  });
  el.addEventListener('dragleave', () => el.classList.remove('drop-before', 'drop-after', 'drop-into'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropOnPinned({ id: item.id, pos: posFor(e) });
  });
}

function makeZone(el, onDrop, accepts = () => true) {
  el.addEventListener('dragover', (e) => {
    if (!drag || !accepts(drag)) return;
    e.preventDefault();
    clearDropMarks();
    el.classList.add('hot');
  });
  el.addEventListener('dragleave', (e) => { if (!el.contains(e.relatedTarget)) el.classList.remove('hot'); });
  el.addEventListener('drop', (e) => {
    if (!drag || !accepts(drag)) return;
    e.preventDefault();
    const d = drag;
    drag = null;
    clearDropMarks();
    onDrop(d);
  });
}

async function dropOnPinned(target) {
  const d = drag;
  drag = null;
  clearDropMarks();
  const space = currentSpace();
  if (!d || !space) return;

  if (d.kind === 'fav') {
    const f = (S.favorites || []).find((x) => x.id === d.favId);
    if (!f) return;
    const item = { id: uid(), type: 'link', title: f.title || f.url, url: f.url };
    await mutateSpace(space.id, (s) => insertAt(s.items, item, target));
    await send('removeFavorite', { favId: f.id });
    return;
  }
  if (d.kind === 'tab') {
    if (d.fav) await (d.favId ? send('removeFavorite', { favId: d.favId }) : chrome.tabs.update(d.tabId, { pinned: false })).catch(() => {});
    const tab = tabById(d.tabId);
    const url = tab && (tab.url || tab.pendingUrl);
    if (!url || url.startsWith('chrome://newtab')) return;
    const item = { id: uid(), type: 'link', title: tab.title || url, url };
    await mutateSpace(space.id, (s) => insertAt(s.items, item, target));
    await send('mapPinned', { itemId: item.id, tabId: tab.id });
    return;
  }
  if (d.kind === 'item') {
    await mutateSpace(space.id, (s) => {
      const loc = locate(s.items, d.id);
      if (!loc) return;
      if (target && target.id && loc.item.type === 'folder' && (loc.item.id === target.id || contains(loc.item, target.id))) return;
      loc.list.splice(loc.index, 1);
      insertAt(s.items, loc.item, target);
    });
  }
}

// ---------- tab audio ----------

const isMuted = (tab) => !!(tab && tab.mutedInfo && tab.mutedInfo.muted);
const toggleMute = (tab) => chrome.tabs.update(tab.id, { muted: !isMuted(tab) });
const muteMenuEntry = (tab) => tab && (tab.audible || isMuted(tab)) && { label: isMuted(tab) ? 'Unmute tab' : 'Mute tab', run: () => toggleMute(tab) };

// Speaker button shown while a tab plays sound (or is muted). Click toggles mute without switching tabs.
function audioButton(tab, cls = 'audio') {
  if (!tab || !(tab.audible || isMuted(tab))) return null;
  const muted = isMuted(tab);
  return h('button', {
    class: `${cls}${muted ? ' is-muted' : ''}`, title: muted ? 'Unmute tab' : 'Mute tab', html: muted ? ICON.muted : ICON.audio,
    draggable: 'false',
    onclick: (e) => { e.stopPropagation(); e.preventDefault(); toggleMute(tab); },
    onmousedown: (e) => e.stopPropagation(),
  });
}

// ---------- favorites ----------
// Favorites are Chrome's own pinned tabs, so they stay put across spaces like Arc's.

let toastTimer = null;
function toast(msg, actions = [], ms = 1400) {
  let el = document.getElementById('toast');
  if (!el) {
    el = h('div', { id: 'toast', class: 'toast' });
    // Keep an action toast up while the pointer is on it.
    el.addEventListener('mouseenter', () => clearTimeout(toastTimer));
    el.addEventListener('mouseleave', () => { if (el.classList.contains('has-actions')) toastTimer = setTimeout(() => el.classList.remove('show'), 1500); });
    document.body.append(el);
  }
  el.innerHTML = '';
  el.append(h('span', { class: 'msg' }, msg));
  for (const a of actions) {
    el.append(h('button', {
      class: 'toast-btn', title: a.title || a.label, html: a.icon || null,
      onclick: async () => { const keep = await a.run(); if (!keep) el.classList.remove('show'); },
    }, a.icon ? null : a.label));
  }
  el.classList.toggle('has-actions', actions.length > 0);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), actions.length ? Math.max(ms, 6000) : ms);
}

// ---------- full-page screenshot ----------

function shotFilename(info) {
  let host = 'page';
  try { host = new URL(info.url).hostname.replace(/^www\./, ''); } catch (_) { /* keep default */ }
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `Screenshot ${host} ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} at ${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}.png`;
}

async function takeScreenshot(btn) {
  if (btn) btn.classList.add('busy');
  let res;
  try {
    res = await send('screenshot');
  } finally {
    if (btn) btn.classList.remove('busy');
  }
  if (!res || !res.ok) { toast(((res && res.error) || 'Screenshot failed').replace(/^Error: /, ''), [], 2600); return; }
  const info = res.result;
  const blob = await (await fetch(info.dataUrl)).blob();
  const save = () => {
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: shotFilename(info) });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast('Saved to Downloads');
    return true;
  };
  const copy = async () => {
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); return true; } catch (_) { return false; }
  };
  const share = async () => {
    try { await navigator.share({ files: [new File([blob], shotFilename(info), { type: 'image/png' })], title: info.title }); } catch (_) { /* cancelled */ }
  };
  const note = info.partial ? ' (visible area only)' : info.truncated ? ' (trimmed, very long page)' : '';
  const actions = [{ label: 'Save', run: save }];
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'x.png', { type: 'image/png' })] })) {
    actions.push({ label: 'Share', icon: ICON.share, run: share });
  }
  toast(`Screenshot ready${note}`, [
    { label: 'Copy', run: async () => { toast((await copy()) ? 'Copied to clipboard' : 'Couldn\u2019t copy'); return true; } },
    { label: 'Download', run: save },
    ...actions.slice(1),
  ]);
}

async function copyUrl(url) {
  if (!url) return false;
  try { await navigator.clipboard.writeText(url); toast('Copied URL'); return true; } catch (_) { toast('Couldn’t copy'); return false; }
}

async function addTabToFavorites(tabId, index) {
  await send('addFavorite', { tabId, index });
}

async function addItemToFavorites(itemId, index) {
  const space = currentSpace();
  const loc = space && locate(space.items, itemId);
  if (!loc || loc.item.type !== 'link') return;
  const tabId = S.pinnedTabs[itemId];
  const tab = tabId != null ? tabById(tabId) : null;
  await unpinItem(itemId);
  if (tab) return addTabToFavorites(tab.id, index);
  await send('addFavorite', { url: loc.item.url, title: loc.item.title, index });
}

function dropOnFavorites(d, index) {
  if (!d) return;
  if (d.favId) return send('reorderFavorite', { favId: d.favId, index });
  if (d.kind === 'tab') return addTabToFavorites(d.tabId, index);
  if (d.kind === 'item') return addItemToFavorites(d.id, index);
}

// Tiles come from the shared favorites list. A favorite that isn't open in this window yet
// shows dimmed and opens here as a pinned tab when clicked.
function favoriteTiles() {
  const pinned = S.tabs.filter((t) => t.pinned);
  const used = new Set();
  const tiles = (S.favorites || []).map((f) => {
    const tab = pinned.find((t) => !used.has(t.id) && S.favTabs[t.id] === f.id) || null;
    if (tab) used.add(tab.id);
    return { fav: f, tab };
  });
  // Pinned tabs the background hasn't linked yet (just pinned from Chrome's own menu).
  pinned.filter((t) => !used.has(t.id) && !S.favTabs[t.id]).forEach((t) => tiles.push({ fav: null, tab: t }));
  return tiles;
}

function renderFavorites() {
  const tiles = favoriteTiles();
  const zone = h('div', { class: 'favorites' });
  // 6-column grid: tiles span 2 (thirds). A last row with two tiles spans 3 each (halves).
  const twoUp = tiles.length % 3 === 2;
  tiles.forEach(({ fav, tab: t }, i) => {
    const half = twoUp && i >= tiles.length - 2;
    const url = t ? t.url : fav.url;
    const favId = fav && fav.id;
    const remove = () => (favId ? send('removeFavorite', { favId }) : chrome.tabs.update(t.id, { pinned: false }));
    const b = h('button', {
      class: `fav${t && t.active ? ' active' : ''}${t ? '' : ' unloaded'}`, title: (t ? t.title : fav.title) || url,
      style: `grid-column: span ${half ? 3 : 2}`,
      onclick: () => (t ? chrome.tabs.update(t.id, { active: true }) : send('openFavorite', { favId })),
      onauxclick: (e) => { if (e.button === 1 && t) chrome.tabs.remove(t.id); },
      oncontextmenu: (e) => showMenu(e, [
        t && muteMenuEntry(t),
        { label: 'Copy link', run: () => copyUrl(url) },
        { label: 'Pin to this space', run: () => { drag = t ? { kind: 'tab', tabId: t.id, fav: true, favId } : { kind: 'fav', favId }; dropOnPinned(null); } },
        { label: 'Remove from favorites', run: remove },
        t && '-',
        t && { label: 'Close', danger: true, run: () => chrome.tabs.remove(t.id) },
      ].filter(Boolean)),
    }, h('img', { src: faviconFor(url, t && t.favIconUrl), alt: '' }), t ? audioButton(t, 'fav-audio') : null);
    makeDraggable(b, t ? { kind: 'tab', tabId: t.id, fav: true, favId } : { kind: 'fav', favId }, url);
    const after = (e) => { const r = b.getBoundingClientRect(); return e.clientX >= r.left + r.width / 2; };
    b.addEventListener('dragover', (e) => {
      if (!drag || (drag.favId && drag.favId === favId)) return;
      e.preventDefault(); e.stopPropagation();
      clearDropMarks();
      b.classList.add(after(e) ? 'drop-right' : 'drop-left');
    });
    b.addEventListener('dragleave', () => b.classList.remove('drop-left', 'drop-right'));
    b.addEventListener('drop', (e) => {
      e.preventDefault(); e.stopPropagation();
      const d = drag; drag = null; clearDropMarks();
      dropOnFavorites(d, i + (after(e) ? 1 : 0));
    });
    zone.append(b);
  });
  makeZone(zone, (d) => dropOnFavorites(d, tiles.length), (d) => !(d.fav || d.kind === 'fav'));
  return zone;
}

// ---------- actions ----------

async function unpinItem(itemId) {
  const space = currentSpace();
  let ids = [];
  await mutateSpace(space.id, (s) => {
    const loc = locate(s.items, itemId);
    if (!loc) return;
    ids = loc.item.type === 'folder' ? linkIds(loc.item.children) : [loc.item.id];
    loc.list.splice(loc.index, 1);
  });
  if (ids.length) await send('unmapPinned', { itemIds: ids });
}

function startRename(id, value) {
  S.renaming = id;
  S.renameValue = value || '';
  render();
}

async function commitRename() {
  const id = S.renaming;
  const value = S.renameValue.trim();
  S.renaming = null;
  if (!id) return;
  if (value) {
    const space = currentSpace();
    await mutateSpace(space.id, (s) => {
      const loc = locate(s.items, id);
      if (loc) loc.item.title = value;
    });
  }
  render();
}

async function newFolder(parentId = null) {
  const space = currentSpace();
  const folder = { id: uid(), type: 'folder', title: 'New Folder', open: true, children: [] };
  await mutateSpace(space.id, (s) => insertAt(s.items, folder, parentId ? { id: parentId, pos: 'into' } : null));
  S.renaming = folder.id;
  S.renameValue = folder.title;
  render();
}

// ---------- folders & multi-select ----------

const keyFor = (kind, id) => `${kind}:${id}`;
const isSelected = (kind, id) => S.selected.has(keyFor(kind, id));

// Cmd/Ctrl-click toggles, Shift-click selects a range. Returns true when the click was a selection click.
function handleSelectClick(e, kind, id) {
  const key = keyFor(kind, id);
  if (e.shiftKey && S.anchor && S.order.includes(S.anchor)) {
    const a = S.order.indexOf(S.anchor), b = S.order.indexOf(key);
    if (b !== -1) {
      if (!(e.metaKey || e.ctrlKey)) S.selected.clear();
      S.order.slice(Math.min(a, b), Math.max(a, b) + 1).forEach((k) => S.selected.add(k));
      render();
      return true;
    }
  }
  if (e.metaKey || e.ctrlKey || e.shiftKey) {
    if (S.selected.has(key)) S.selected.delete(key); else S.selected.add(key);
    S.anchor = key;
    render();
    return true;
  }
  S.anchor = key;
  if (S.selected.size) { S.selected.clear(); render(); }
  return false;
}

// Keys to act on for a right-click: the whole selection if the row is part of it, else just that row.
function targetKeys(kind, id) {
  const key = keyFor(kind, id);
  if (S.selected.has(key) && S.selected.size > 1) return S.order.filter((k) => S.selected.has(k));
  if (S.selected.size) { S.selected.clear(); render(); }
  return [key];
}

function folderList(items, depth = 0, out = []) {
  for (const it of items) {
    if (it.type !== 'folder') continue;
    out.push({ folder: it, depth });
    folderList(it.children, depth + 1, out);
  }
  return out;
}

// Moves tabs and pinned items (given as "tab:<id>" / "item:<id>" keys) into a folder, or the top level when folderId is null.
async function moveKeysInto(keys, folderId, beforeId = null) {
  const space = currentSpace();
  const mapped = [];
  await mutateSpace(space.id, (s) => {
    const dest = folderId ? (locate(s.items, folderId) || {}).item : null;
    if (folderId && !dest) return;
    const list = dest ? dest.children : s.items;
    const moving = [];
    for (const key of keys) {
      const [kind, raw] = key.split(':');
      if (kind === 'item') {
        const loc = locate(s.items, raw);
        if (!loc || loc.item.id === folderId) continue;
        if (loc.item.type === 'folder' && dest && (loc.item.id === dest.id || contains(loc.item, dest.id))) continue;
        loc.list.splice(loc.index, 1);
        moving.push(loc.item);
      } else {
        const tab = tabById(Number(raw));
        const url = tab && (tab.url || tab.pendingUrl);
        if (!url || url.startsWith('chrome://newtab')) continue;
        const item = { id: uid(), type: 'link', title: tab.title || url, url };
        mapped.push([item.id, tab.id, tab.pinned]);
        moving.push(item);
      }
    }
    const at = beforeId ? list.findIndex((x) => x.id === beforeId) : -1;
    if (at >= 0) list.splice(at, 0, ...moving); else list.push(...moving);
    if (dest) dest.open = true;
  });
  for (const [itemId, tabId, wasFav] of mapped) {
    if (wasFav) await chrome.tabs.update(tabId, { pinned: false }).catch(() => {});
    await send('mapPinned', { itemId, tabId });
  }
  S.selected.clear();
}

// Creates a folder holding the given keys, placed where the first pinned item was, and starts renaming it.
async function groupIntoFolder(keys) {
  const space = currentSpace();
  const folder = { id: uid(), type: 'folder', title: 'New Folder', open: true, children: [] };
  const firstItem = keys.find((k) => k.startsWith('item:'));
  await mutateSpace(space.id, (s) => {
    const loc = firstItem ? locate(s.items, firstItem.slice(5)) : null;
    if (loc) loc.list.splice(loc.index, 0, folder); else s.items.push(folder);
  });
  await moveKeysInto(keys, folder.id);
  S.renaming = folder.id;
  S.renameValue = folder.title;
  render();
}

function newFolderFromSelection() {
  if (S.selected.size) return groupIntoFolder(S.order.filter((k) => S.selected.has(k)));
  S.view = 'main';
  return newFolder().then(render);
}

// "Move to folder" drill-in entries for the given keys.
function moveToFolderEntries(keys) {
  const space = currentSpace();
  const movingIds = new Set(keys.filter((k) => k.startsWith('item:')).map((k) => k.slice(5)));
  const folders = folderList(space.items).filter(({ folder }) => !movingIds.has(folder.id));
  return [
    { label: 'Pinned (no folder)', run: () => moveKeysInto(keys, null) },
    ...(folders.length ? ['-'] : []),
    ...folders.map(({ folder, depth }) => ({ label: folder.title, indent: depth, run: () => moveKeysInto(keys, folder.id) })),
    '-',
    { label: 'New folder…', run: () => groupIntoFolder(keys) },
  ];
}

function multiMenu(keys) {
  const tabIds = keys.filter((k) => k.startsWith('tab:')).map((k) => Number(k.slice(4)));
  const itemIds = keys.filter((k) => k.startsWith('item:')).map((k) => k.slice(5));
  return [
    { heading: `${keys.length} selected` },
    { label: 'Group into folder', run: () => groupIntoFolder(keys) },
    { label: 'Move to folder', more: () => moveToFolderEntries(keys) },
    '-',
    tabIds.length && { label: `Close ${tabIds.length === 1 ? 'tab' : `${tabIds.length} tabs`}`, danger: true, run: () => { S.selected.clear(); chrome.tabs.remove(tabIds); } },
    itemIds.length && { label: `Unpin ${itemIds.length === 1 ? 'item' : `${itemIds.length} items`}`, danger: true, run: async () => { S.selected.clear(); for (const id of itemIds) await unpinItem(id); } },
  ];
}

async function setFolderOpen(id, open) {
  const space = currentSpace();
  await mutateSpace(space.id, (s) => {
    const loc = locate(s.items, id);
    if (loc) loc.item.open = open;
  });
}

function switchTo(spaceId) {
  return send('switchSpace', { spaceId });
}

// ---------- menus and modals ----------

const menuEl = document.getElementById('menu');

function showMenu(e, entries) {
  e.preventDefault();
  e.stopPropagation();
  fillMenu(entries, e);
  menuEl.hidden = false;
  const { innerWidth: W, innerHeight: H } = window;
  const r = menuEl.getBoundingClientRect();
  menuEl.style.left = `${Math.min(e.clientX, W - r.width - 6)}px`;
  menuEl.style.top = `${Math.min(e.clientY, H - r.height - 6)}px`;
}
function fillMenu(entries, e) {
  menuEl.innerHTML = '';
  for (const en of entries.filter(Boolean)) {
    if (en === '-') { menuEl.append(h('hr')); continue; }
    if (en.heading) { menuEl.append(h('div', { class: 'menu-heading' }, en.heading)); continue; }
    menuEl.append(h('button', {
      class: `${en.danger ? 'danger' : ''}${en.more ? ' has-more' : ''}`,
      style: en.indent ? `padding-left:${10 + en.indent * 14}px` : null,
      onclick: (ev) => {
        ev.stopPropagation();
        if (en.more) {
          fillMenu([{ label: '\u2039 Back', run: () => fillMenu(entries, e), keep: true }, '-', ...en.more()], e);
          const { innerWidth: W, innerHeight: H } = window;
          const r = menuEl.getBoundingClientRect();
          menuEl.style.left = `${Math.max(6, Math.min(r.left, W - r.width - 6))}px`;
          menuEl.style.top = `${Math.max(6, Math.min(r.top, H - r.height - 6))}px`;
          return;
        }
        if (!en.keep) hideMenu();
        en.run();
      },
    }, h('span', {}, en.label), en.more ? h('span', { class: 'more' }, '\u203a') : null));
  }
}
function hideMenu() { menuEl.hidden = true; }
document.addEventListener('click', (e) => { if (!menuEl.contains(e.target)) hideMenu(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && closeEmojiPicker()) return;
  if (e.key === 'Escape') { hideMenu(); closeModal(); if (S.selected.size) { S.selected.clear(); render(); } }
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey && e.code === 'KeyC' && !e.target.matches('input')) {
    e.preventDefault();
    const t = S.tabs.find((x) => x.active);
    if (t) copyUrl(t.url);
  }
  if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === 'KeyN' && !e.target.matches('input')) { e.preventDefault(); newFolderFromSelection(); }
});
window.addEventListener('blur', hideMenu);

document.addEventListener('click', () => closeEmojiPicker());
function closeModal() { document.getElementById('modal-root').innerHTML = ''; render(); }

function spaceModal(existing) {
  let tint = existing ? tintOf(existing) : TINTS[S.spaces.length % TINTS.length][0];
  let emoji = existing ? existing.emoji || '' : '\u2728';
  const emojiBtn = h('button', { class: 'emoji-btn', title: 'Choose an emoji' });
  const drawEmoji = () => { emojiBtn.innerHTML = ''; emojiBtn.append(emoji ? emoji : h('span', { class: 'emoji-none', style: `background:${tint}` })); };
  drawEmoji();
  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEmojiPicker(emojiBtn, (picked) => { emoji = picked; drawEmoji(); });
  });
  const nameIn = h('input', { class: 'name-in', value: existing ? existing.name : '', placeholder: 'Space name' });
  const swatches = h('div', { class: 'swatches' });
  const drawSwatches = () => {
    swatches.innerHTML = '';
    const list = TINTS.some(([hex]) => hex === tint) ? TINTS : [[tint, null], ...TINTS];
    for (const [hex] of list) {
      swatches.append(h('button', {
        class: `swatch${hex === tint ? ' on' : ''}`, style: `background:${hex}`,
        onclick: () => { tint = hex; drawSwatches(); drawEmoji(); applyTheme(hex); },
      }));
    }
  };
  drawSwatches();

  const save = async () => {
    const name = nameIn.value.trim() || 'Untitled';
    const match = TINTS.find(([hex]) => hex === tint);
    const color = match ? match[1] : (existing ? existing.color : 'purple');
    closeModal();
    if (existing) {
      await mutateSpace(existing.id, (s) => Object.assign(s, { name, emoji, color, tint }));
    } else {
      const space = { id: uid(), name, emoji, color, tint, items: [] };
      await mutateSpaces((spaces) => spaces.push(space));
      await switchTo(space.id);
    }
  };
  nameIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });

  const root = document.getElementById('modal-root');
  root.innerHTML = '';
  root.append(h('div', { class: 'backdrop', onclick: (e) => { if (e.target === e.currentTarget) closeModal(); } },
    h('div', { class: 'modal' },
      h('h3', {}, existing ? 'Edit space' : 'New space'),
      h('div', { class: 'fields' }, emojiBtn, nameIn),
      swatches,
      h('div', { class: 'actions' },
        h('button', { onclick: closeModal }, 'Cancel'),
        h('button', { class: 'primary', onclick: save }, existing ? 'Save' : 'Create')))));
  setTimeout(() => nameIn.focus(), 0);
}

// ---------- emoji picker ----------

const EMOJI_GROUPS = [
  [-1, '\u{1F552}', 'Recent'], [0, '\u{1F600}', 'Smileys & Emotion'], [1, '\u{1F44B}', 'People & Body'],
  [3, '\u{1F43B}', 'Animals & Nature'], [4, '\u{1F354}', 'Food & Drink'], [5, '\u{1F697}', 'Travel & Places'],
  [6, '⚽', 'Activities'], [7, '\u{1F4A1}', 'Objects'], [8, '\u{1F523}', 'Symbols'], [9, '\u{1F3C1}', 'Flags'],
];
let emojiData = null;
async function loadEmoji() {
  if (!emojiData) emojiData = await (await fetch(chrome.runtime.getURL('emoji.json'))).json();
  return emojiData;
}
async function recentEmoji() {
  try { return (await chrome.storage.local.get('recentEmoji')).recentEmoji || []; } catch (_) { return []; }
}
async function rememberEmoji(e) {
  const list = (await recentEmoji()).filter((x) => x !== e);
  await chrome.storage.local.set({ recentEmoji: [e, ...list].slice(0, 24) });
}

function closeEmojiPicker() {
  const el = document.getElementById('emoji-picker');
  if (el) { el.remove(); return true; }
  return false;
}

async function openEmojiPicker(anchor, onPick) {
  if (closeEmojiPicker()) return;
  const [data, recent] = await Promise.all([loadEmoji(), recentEmoji()]);
  const search = h('input', { class: 'emoji-search', placeholder: 'Search emoji', spellcheck: 'false' });
  const grid = h('div', { class: 'emoji-grid' });
  const tabs = h('div', { class: 'emoji-tabs' });
  const pick = (e) => { closeEmojiPicker(); onPick(e); if (e) rememberEmoji(e); };
  const cell = ([e, kw]) => h('button', { class: 'emoji-cell', title: kw.split(' ').slice(0, 3).join(' '), onclick: () => pick(e) }, e);

  const drawAll = () => {
    grid.innerHTML = '';
    for (const [g, , label] of EMOJI_GROUPS) {
      const items = g === -1 ? recent.map((e) => [e, '']) : data.filter((d) => d[2] === g);
      if (!items.length) continue;
      grid.append(h('div', { class: 'emoji-head', id: `emoji-g${g}` }, label), h('div', { class: 'emoji-cells' }, items.map(cell)));
    }
  };
  const drawSearch = (q) => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = data.filter(([, kw]) => words.every((w) => kw.includes(w)))
      .sort((a, b) => (b[1].startsWith(words[0]) ? 1 : 0) - (a[1].startsWith(words[0]) ? 1 : 0));
    grid.innerHTML = '';
    grid.append(hits.length ? h('div', { class: 'emoji-cells' }, hits.slice(0, 400).map(cell)) : h('div', { class: 'emoji-empty' }, 'No emoji found'));
  };

  for (const [g, icon, label] of EMOJI_GROUPS) {
    if (g === -1 && !recent.length) continue;
    tabs.append(h('button', {
      class: 'emoji-tab', title: label,
      onclick: () => {
        if (search.value) { search.value = ''; drawAll(); }
        const head = grid.querySelector(`#emoji-g${g}`);
        if (head) grid.scrollTop = head.offsetTop - grid.offsetTop;
      },
    }, icon));
  }
  search.addEventListener('input', () => (search.value.trim() ? drawSearch(search.value.trim()) : drawAll()));
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); closeEmojiPicker(); anchor.focus(); }
    if (e.key === 'Enter') { const first = grid.querySelector('.emoji-cell'); if (first) first.click(); }
  });

  const panel = h('div', { id: 'emoji-picker', class: 'emoji-picker', onclick: (e) => e.stopPropagation() },
    h('div', { class: 'emoji-top' }, search, h('button', { class: 'emoji-remove', title: 'No emoji (use a color dot)', onclick: () => pick('') }, 'None')),
    tabs, grid);
  drawAll();
  const modal = anchor.closest('.modal');
  modal.append(panel);
  const a = anchor.getBoundingClientRect(), m = modal.getBoundingClientRect();
  panel.style.top = `${a.bottom - m.top + 6}px`;
  setTimeout(() => search.focus(), 0);
}

function spaceMenuEntries(space) {
  return [
    { label: 'Edit space…', run: () => spaceModal(space) },
    { label: 'New folder', run: () => newFolder() },
    { label: "Archive today's tabs", run: () => send('clearToday', { spaceId: space.id }) },
    S.spaces.length > 1 && '-',
    S.spaces.length > 1 && {
      label: 'Delete space', danger: true,
      run: () => {
        if (confirm(`Delete "${space.name}"? Its open tabs will be moved to the archive.`)) send('deleteSpace', { spaceId: space.id });
      },
    },
  ];
}


// ---------- theme ----------
// Builds Arc-like pastel colors from a space color. Done in JS (not CSS relative colors)
// so it works on every Chrome version.
function hexToOklch(hex) {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const r = lin((n >> 16) & 255), g = lin((n >> 8) & 255), b = lin(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * q;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * q;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * q;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
let themeHex = null;
function applyTheme(hex) {
  themeHex = hex;
  document.documentElement.classList.toggle('tinted', !!S.settings.tintBackground);
  document.documentElement.style.setProperty('--panel-bg', S.settings.panelBg || '#f9f9ff');
  document.documentElement.style.setProperty('--panel-bg-dark', S.settings.panelBgDark || '#1f1f23');
  const { C, H } = hexToOklch(hex);
  const ok = (l, c, dh = 0) => `oklch(${l} ${Math.min(c, 0.2).toFixed(4)} ${((H + dh + 360) % 360).toFixed(1)})`;
  const dark = darkQuery.matches;
  // Three-stop gradient that drifts from a cool top to a warmer bottom, like Arc.
  // Tuned so lavender gives exactly #E7E7FF, #EBE9FE, #F5EDF9.
  const vars = dark
    ? { '--bg-top': ok(0.29, C * 0.4, -16), '--bg-mid': ok(0.265, C * 0.34, -12), '--bg-bottom': ok(0.24, C * 0.24, 13),
        '--folder': ok(0.8, C * 1.2), '--accent-strong': ok(0.62, C * 1.4) }
    : { '--bg-top': ok(0.935, C * 0.289, -16.2), '--bg-mid': ok(0.942, C * 0.252, -11.7), '--bg-bottom': ok(0.956, C * 0.161, 12.8),
        '--ink': ok(0.26, C * 0.45), '--folder': ok(0.5, C * 1.6), '--accent-strong': ok(0.56, C * 1.5) };
  const st = document.documentElement.style;
  st.setProperty('--accent', hex);
  if (dark) st.removeProperty('--ink');
  for (const [k, v] of Object.entries(vars)) st.setProperty(k, v);
}
darkQuery.addEventListener('change', () => themeHex && applyTheme(themeHex));

// ---------- rendering ----------

function renderItem(item, depth, space, out) {
  const activeId = activeTabId();
  if (item.type === 'folder') {
    const isRenaming = S.renaming === item.id;
    const row = h('div', {
      class: `row folder${item.open ? ' open' : ''}${isSelected('item', item.id) ? ' selected' : ''}`, style: `--depth:${depth}`,
      onclick: (e) => !isRenaming && !handleSelectClick(e, 'item', item.id) && setFolderOpen(item.id, !item.open),
      oncontextmenu: (e) => { const keys = targetKeys('item', item.id); showMenu(e, keys.length > 1 ? multiMenu(keys) : [
        { label: 'Rename', run: () => startRename(item.id, item.title) },
        { label: 'New folder inside', run: () => newFolder(item.id) },
        { label: 'Move to folder', more: () => moveToFolderEntries(keys) },
        '-',
        { label: 'Delete folder', danger: true, run: () => {
          if (!item.children.length || confirm(`Delete "${item.title}" and everything in it?`)) unpinItem(item.id);
        } },
      ]); },
    },
    h('span', { class: 'glyph', html: item.open ? ICON.folderOpen : ICON.folder }),
    isRenaming ? renameInput() : h('span', { class: 'title', ondblclick: () => startRename(item.id, item.title) }, item.title),
    null);
    makeDraggable(row, { kind: 'item', id: item.id });
    makeItemDropTarget(row, item);
    out.push(row);
    S.order.push(keyFor('item', item.id));
    if (item.open) item.children.forEach((c) => renderItem(c, depth + 1, space, out));
    return;
  }

  const tabId = S.pinnedTabs[item.id];
  const tab = tabId != null ? tabById(tabId) : null;
  const isRenaming = S.renaming === item.id;
  const navigated = !!(tab && tab.url && !sameUrl(tab.url, item.url));
  const row = h('div', {
    class: `row item${tab ? ' open' : ''}${tab && tab.id === activeId ? ' active' : ''}${navigated ? ' tall' : ''}${isSelected('item', item.id) ? ' selected' : ''}`,
    style: `--depth:${depth}`, title: item.url,
    onclick: (e) => !isRenaming && !handleSelectClick(e, 'item', item.id) && send('openItem', { itemId: item.id }),
    onauxclick: (e) => { if (e.button === 1 && tab) chrome.tabs.remove(tab.id); },
    oncontextmenu: (e) => { const keys = targetKeys('item', item.id); showMenu(e, keys.length > 1 ? multiMenu(keys) : [
      { label: 'Open', run: () => send('openItem', { itemId: item.id }) },
      { label: 'Add to Favorites', run: () => addItemToFavorites(item.id) },
      { label: 'New folder with this tab', run: () => groupIntoFolder(keys) },
      { label: 'Move to folder', more: () => moveToFolderEntries(keys) },
      { label: 'Rename', run: () => startRename(item.id, item.title) },
      muteMenuEntry(tab),
      { label: 'Copy link', run: () => copyUrl(item.url) },
      tab && tab.url && tab.url !== item.url && { label: 'Go back to pinned URL', run: () => chrome.tabs.update(tab.id, { url: item.url }) },
      tab && tab.url && tab.url !== item.url && {
        label: 'Pin the current URL instead',
        run: () => mutateSpace(space.id, (s) => { const l = locate(s.items, item.id); if (l) l.item.url = tab.url; }),
      },
      '-',
      { label: tab ? 'Unpin (keep tab open)' : 'Unpin', danger: true, run: () => unpinItem(item.id) },
    ]); },
  },
  favImg(item.url, tab && tab.favIconUrl),
  navigated ? h('button', {
    class: 'slash', title: 'Back to pinned URL',
    onclick: (e) => { e.stopPropagation(); chrome.tabs.update(tab.id, { url: item.url }); },
  }, '/') : null,
  isRenaming ? renameInput() : navigated
    ? h('span', { class: 'title two' }, h('span', { class: 't1' }, item.title), h('span', { class: 't2' }, shortUrl(tab.url)))
    : h('span', { class: 'title' }, item.title),
  audioButton(tab),
  tab ? h('button', {
    class: 'x', title: 'Close tab (stays pinned)', html: ICON.x,
    onclick: (e) => { e.stopPropagation(); chrome.tabs.remove(tab.id); },
  }) : null);
  makeDraggable(row, { kind: 'item', id: item.id }, item.url);
  makeItemDropTarget(row, item);
  out.push(row);
  S.order.push(keyFor('item', item.id));
}

function renameInput() {
  const input = h('input', {
    class: 'rename', value: S.renameValue,
    oninput: (e) => { S.renameValue = e.target.value; },
    onkeydown: (e) => {
      if (e.key === 'Enter') commitRename();
      if (e.key === 'Escape') { S.renaming = null; render(); }
      e.stopPropagation();
    },
    onblur: () => { if (S.renaming) commitRename(); },
    onclick: (e) => e.stopPropagation(),
  });
  setTimeout(() => { input.focus(); input.select(); }, 0);
  return input;
}

function renderTabRow(tab, space) {
  const others = S.spaces.filter((s) => s.id !== space.id);
  const row = h('div', {
    class: `row tab${tab.active ? ' active' : ''}${isSelected('tab', tab.id) ? ' selected' : ''}`, title: tab.url || '',
    onclick: (e) => !handleSelectClick(e, 'tab', tab.id) && chrome.tabs.update(tab.id, { active: true }),
    onauxclick: (e) => { if (e.button === 1) chrome.tabs.remove(tab.id); },
    oncontextmenu: (e) => { const keys = targetKeys('tab', tab.id); showMenu(e, keys.length > 1 ? multiMenu(keys) : [
      { label: 'Add to Favorites', run: () => addTabToFavorites(tab.id) },
      { label: 'Pin to this space', run: () => { drag = { kind: 'tab', tabId: tab.id }; dropOnPinned(null); } },
      { label: 'New folder with this tab', run: () => groupIntoFolder(keys) },
      { label: 'Move to folder', more: () => moveToFolderEntries(keys) },
      ...others.map((o) => ({ label: `Move to ${groupTitle(o)}`, run: () => send('moveTabToSpace', { tabId: tab.id, spaceId: o.id }) })),
      muteMenuEntry(tab),
      { label: 'Duplicate', run: () => chrome.tabs.duplicate(tab.id) },
      { label: 'Copy link', run: () => copyUrl(tab.url || '') },
      '-',
      { label: 'Close', danger: true, run: () => chrome.tabs.remove(tab.id) },
    ]); },
  },
  favImg(tab.url || tab.pendingUrl, tab.favIconUrl),
  h('span', { class: 'title' }, tab.title || tab.pendingUrl || 'New Tab'),
  audioButton(tab),
  h('button', { class: 'x', title: 'Close', html: ICON.x, onclick: (e) => { e.stopPropagation(); chrome.tabs.remove(tab.id); } }));
  makeDraggable(row, { kind: 'tab', tabId: tab.id }, tab.url);
  makeTabDropTarget(row, tab);
  S.order.push(keyFor('tab', tab.id));
  return row;
}

// This space's tabs that are open in other windows, so a new window still shows them.
function otherWindowTabs(space) {
  const title = groupTitle(space);
  const gids = new Set((S.otherGroups || []).filter((g) => g.title === title).map((g) => g.id));
  const mapped = new Set(Object.values(S.pinnedTabs).map(Number));
  return (S.otherTabs || []).filter((t) => gids.has(t.groupId) && !mapped.has(t.id));
}

function renderMain(space) {
  const scroll = h('div', { class: 'scroll' });

  // Favorites: Chrome's own pinned tabs, shown as icon tiles like Arc's favorites.
  if ((S.favorites && S.favorites.length) || S.tabs.some((t) => t.pinned)) scroll.append(renderFavorites());

  // Space name, like Arc's label above the pinned section.
  scroll.append(h('div', {
    class: 'space-label', title: 'Right-click for space options',
    ondblclick: () => spaceModal(space),
    oncontextmenu: (e) => showMenu(e, spaceMenuEntries(space)),
  }, h('span', { class: 'space-icon' }, space.emoji || h('span', { class: 'space-dot-icon' })), h('span', {}, space.name)));

  const pinnedZone = h('div', {
    class: 'zone pinned-zone',
    oncontextmenu: (e) => showMenu(e, [{ label: 'New folder', run: () => newFolder().then(render) }]),
  });
  S.order = [];
  const rows = [];
  space.items.forEach((it) => renderItem(it, 0, space, rows));
  if (rows.length) pinnedZone.append(...rows);
  else pinnedZone.append(h('div', { class: 'dropzone' }, 'Drag tabs here to pin them, or ',
    h('button', { class: 'inline-link', onclick: () => newFolder().then(render) }, 'create a folder')));
  makeZone(pinnedZone, (d) => { drag = d; dropOnPinned(null); });
  scroll.append(pinnedZone);

  // Today
  const gid = groupIdFor(space);
  const pinnedIds = pinnedTabSet();
  const today = gid == null ? [] : S.tabs.filter((t) => t.groupId === gid && !t.pinned && !pinnedIds.has(t.id));
  scroll.append(h('div', { class: 'divider' },
    h('span', { class: 'rule' }),
    today.length ? h('span', { class: 'acts' },
      today.length > 1 ? h('button', {
        class: 'clear', title: 'Close duplicate tabs and sort by site',
        onclick: async () => {
          const res = await send('tidyToday', { spaceId: space.id });
          const r = (res && res.result) || {};
          toast(r.closed ? `Closed ${plural(r.closed, 'duplicate')} \u00b7 sorted by site` : 'Sorted by site');
        },
      }, h('span', { html: ICON.tidy, style: 'display:grid' }), 'Tidy') : null,
      h('button', {
        class: 'clear', title: 'Archive all of today\u2019s tabs',
        onclick: () => send('clearToday', { spaceId: space.id }),
      }, h('span', { html: ICON.clear, style: 'display:grid' }), 'Clear')) : null));
  const hintEl = renderHint(pickHint(space, today));
  if (hintEl) scroll.append(hintEl);
  const todayZone = h('div', { class: 'zone' },
    h('div', { class: 'row new-tab', onclick: () => send('newTab') }, h('span', { class: 'plus', html: ICON.plus }), h('span', { class: 'title' }, 'New Tab')),
    today.map((t) => renderTabRow(t, space)));
  const elsewhere = otherWindowTabs(space);
  if (elsewhere.length) {
    todayZone.append(h('div', { class: 'elsewhere-label' }, 'In other windows'),
      ...elsewhere.map((t) => h('div', {
        class: 'row tab elsewhere', title: `${t.url || ''}\nClick to bring it into this window`,
        onclick: () => send('bringTab', { tabId: t.id, spaceId: space.id }),
        oncontextmenu: (e) => showMenu(e, [
          { label: 'Bring to this window', run: () => send('bringTab', { tabId: t.id, spaceId: space.id }) },
          { label: 'Go to its window', run: () => { chrome.tabs.update(t.id, { active: true }); chrome.windows.update(t.windowId, { focused: true }); } },
          { label: 'Copy link', run: () => copyUrl(t.url || '') },
          '-',
          { label: 'Close', danger: true, run: () => chrome.tabs.remove(t.id) },
        ]),
      }, favImg(t.url || t.pendingUrl, t.favIconUrl), h('span', { class: 'title' }, t.title || t.pendingUrl || 'New Tab'))));
  }
  makeZone(todayZone, (d) => (d.favId ? send('removeFavorite', { favId: d.favId }) : d.fav ? chrome.tabs.update(d.tabId, { pinned: false }) : unpinItem(d.id)), (d) => d.kind === 'item' || d.fav || d.kind === 'fav');
  scroll.append(todayZone);

  // Swipe sideways on a trackpad to change spaces.
  let acc = 0;
  let cooldown = false;
  scroll.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || cooldown) return;
    acc += e.deltaX;
    if (Math.abs(acc) > 120) {
      const i = S.spaces.indexOf(space);
      const n = S.spaces.length;
      const next = S.spaces[(i + (acc > 0 ? 1 : -1) + n) % n];
      acc = 0;
      cooldown = true;
      setTimeout(() => { cooldown = false; }, 600);
      if (next && next.id !== space.id) switchTo(next.id);
    }
  }, { passive: true });

  return scroll;
}

function renderArchive() {
  const q = S.archiveQuery.toLowerCase();
  const list = S.archive.filter((r) => !q || (r.title || '').toLowerCase().includes(q) || (r.url || '').toLowerCase().includes(q));
  const scroll = h('div', { class: 'scroll' });
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  let lastLabel = null;
  for (const r of list) {
    const label = r.archivedAt >= startOfToday ? 'Today'
      : r.archivedAt >= startOfToday - 86400000 ? 'Yesterday'
      : new Date(r.archivedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (label !== lastLabel) { scroll.append(h('div', { class: 'day' }, label)); lastLabel = label; }
    let host = '';
    try { host = new URL(r.url).hostname.replace(/^www\./, ''); } catch (_) { /* ignore */ }
    scroll.append(h('div', { class: 'row', title: r.url, onclick: () => send('restoreArchived', { id: r.id }) },
      favImg(r.url),
      h('span', { class: 'title' }, r.title),
      h('span', { class: 'meta' }, host),
      h('button', {
        class: 'x', title: 'Remove', html: ICON.x,
        onclick: async (e) => {
          e.stopPropagation();
          const { archive = [] } = await chrome.storage.local.get('archive');
          await chrome.storage.local.set({ archive: archive.filter((x) => x.id !== r.id) });
        },
      })));
  }
  if (!list.length) scroll.append(h('div', { class: 'empty' }, q ? 'Nothing matches.' : 'Archived tabs show up here.'));

  const search = h('input', {
    class: 'search', placeholder: 'Search archive', value: S.archiveQuery,
    oninput: (e) => { S.archiveQuery = e.target.value; render(); },
  });
  const wrap = h('div', { style: 'display:flex;flex-direction:column;height:100%' },
    h('div', { class: 'view-head' },
      h('button', { class: 'icon-btn', html: ICON.back, title: 'Back to settings', onclick: () => { S.view = 'settings'; render(); } }),
      h('h2', {}, 'Archive')),
    search, scroll,
    S.archive.length ? h('button', {
      class: 'footer-btn danger',
      onclick: () => { if (confirm('Clear the whole archive?')) chrome.storage.local.set({ archive: [] }); },
    }, 'Clear archive') : null);
  if (document.activeElement && document.activeElement.classList.contains('search')) {
    setTimeout(() => { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }, 0);
  }
  return wrap;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// ---------- backup ----------

function backupData() {
  return {
    app: 'Arch', format: 1, version: chrome.runtime.getManifest().version, exportedAt: new Date().toISOString(),
    spaces: S.spaces,
    favorites: (S.favorites || []).map((f) => ({ title: f.title, url: f.url })),
    settings: S.settings,
    archive: S.archive,
  };
}

async function exportBackup() {
  const { recentEmoji = [] } = await chrome.storage.local.get('recentEmoji');
  const blob = new Blob([JSON.stringify({ ...backupData(), recentEmoji }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const d = new Date();
  const a = h('a', { href: url, download: `Arch backup ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast('Backup saved to Downloads');
}

function countBackup(data) {
  let links = 0, folders = 0;
  const walk = (items) => (items || []).forEach((it) => { if (it.type === 'folder') { folders++; walk(it.children); } else links++; });
  (data.spaces || []).forEach((s) => walk(s.items));
  return { spaces: (data.spaces || []).length, links, folders, favorites: (data.favorites || []).length };
}

// ---------- settings ----------

const SICON = {
  archive: ['#f59e0b', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="2" y="3" width="12" height="3" rx="0.8"/><path d="M3 6v6.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V6M6.5 8.5h3" stroke-linecap="round"/></svg>'],
  list: ['#8e8e93', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5.5 4.5h7M5.5 8h7M5.5 11.5h7"/><circle cx="3" cy="4.5" r=".6" fill="currentColor"/><circle cx="3" cy="8" r=".6" fill="currentColor"/><circle cx="3" cy="11.5" r=".6" fill="currentColor"/></svg>'],
  broom: ['#ef6c57', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 2.5L7.5 7.5"/><path d="M5 8l5 2.5-1.5 3.5c-2 .2-4.3-.8-5.5-2.7z"/></svg>'],
  palette: ['#a06cd5', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2a6 6 0 100 12c.9 0 1.2-.6 1-1.3-.3-.9.3-1.7 1.2-1.7H12a2 2 0 002-2A6 6 0 008 2z"/><circle cx="5" cy="7" r=".8" fill="currentColor"/><circle cx="8" cy="5" r=".8" fill="currentColor"/><circle cx="11" cy="7" r=".8" fill="currentColor"/></svg>'],
  drop: ['#4b8bf5', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 2.2S4 6.6 4 9.5a4 4 0 008 0C12 6.6 8 2.2 8 2.2z"/></svg>'],
  pip: ['#e5484d', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="1.8" y="3" width="12.4" height="10" rx="1.5"/><rect x="8" y="8" width="4.5" height="3.2" rx=".6" fill="currentColor" stroke="none"/></svg>'],
  keys: ['#636366', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1.8" y="4" width="12.4" height="8" rx="1.5"/><path d="M4.5 6.6h.01M7 6.6h.01M9.5 6.6h.01M12 6.6h.01M5 9.5h6"/></svg>'],
  arc: ['#5b5bd6', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11V3M4.8 7.8L8 11l3.2-3.2M3 13h10"/></svg>'],
  export: ['#30a46c', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10V2.5M5 5.2L8 2.3l3 2.9"/><path d="M3 9.5V13h10V9.5"/></svg>'],
  peek: ['#0090ff', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="1.8" y="2.5" width="12.4" height="11" rx="1.8"/><rect x="5" y="5.5" width="6" height="5" rx="1"/></svg>'],
  sync: ['#3e63dd', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 6.5A5 5 0 004.2 4.2L3 5.5M3 2.5v3h3M3 9.5a5 5 0 008.8 2.3l1.2-1.3M13 13.5v-3h-3"/></svg>'],
  help: ['#ff8a3d', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M6.3 6.2a1.8 1.8 0 113 1.4c-.7.4-1.3.8-1.3 1.6M8 11.3h.01"/></svg>'],
  welcome: ['#a06cd5', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 1.8l1.7 3.9 4.2.4-3.2 2.8 1 4.1L8 10.8 4.3 13l1-4.1-3.2-2.8 4.2-.4z"/></svg>'],
  restore: ['#12a594', '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a5 5 0 105-5c-1.6 0-3 .7-3.9 1.9"/><path d="M3.5 2v3h3"/></svg>'],
};

const tile = (key) => h('span', { class: 'tile', style: `background:${SICON[key][0]}`, html: SICON[key][1] });

function srow({ icon, title, sub, control, onclick, tip }) {
  return h(onclick ? 'button' : 'div', { class: `srow${onclick ? ' link' : ''}`, onclick, title: tip || null },
    tile(icon),
    h('span', { class: 'stext' }, h('span', { class: 'stitle' }, title), sub ? h('span', { class: 'ssub' }, sub) : null),
    control !== undefined ? control : (onclick ? h('span', { class: 'schev', html: ICON.chev }) : null));
}

const sgroup = (label, ...rows) => h('div', { class: 'sgroup' },
  label ? h('div', { class: 'slabel' }, label) : null,
  h('div', { class: 'scard' }, rows.filter(Boolean)));

const toggle = (checked, onchange) => h('label', { class: 'switch', onclick: (e) => e.stopPropagation() },
  h('input', { type: 'checkbox', checked, onchange: (e) => onchange(e.target.checked) }), h('span', { class: 'knob' }));

// A small dialog in the same style as Edit space. Body can be rebuilt by calling the returned redraw.
function dialog(title, build) {
  const root = document.getElementById('modal-root');
  const body = h('div', { class: 'dialog-body' });
  const redraw = () => { body.innerHTML = ''; body.append(...build(redraw).filter(Boolean)); };
  root.innerHTML = '';
  root.append(h('div', { class: 'backdrop', onclick: (e) => { if (e.target === e.currentTarget) closeModal(); } },
    h('div', { class: 'modal' }, h('h3', {}, title), body)));
  redraw();
}

function pickFile(onFile) {
  const input = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
  input.addEventListener('change', () => { if (input.files[0]) onFile(input.files[0]); input.remove(); });
  document.body.append(input);
  input.click();
}

// ---------- finding Arc's file automatically ----------
// With "Allow access to file URLs" turned on for Arch, Chrome lets it read file:// URLs.
// Arc keeps the sidebar in ~/Library/Application Support/Arc/StorableSidebar.json, so we
// list /Users/ to find the account that has one, and take the most recently saved.
const ARC_AUTO = /Mac|Linux/.test(navigator.userAgent) && !/CrOS/.test(navigator.userAgent);
const ARC_DIR = 'Library/Application Support/Arc/';
const fileRows = (html) => [...html.matchAll(/addRow\(("(?:[^"\\]|\\.)*"),("(?:[^"\\]|\\.)*"),(\d),(-?\d+),"[^"]*",(-?\d+)/g)]
  .map((m) => ({ name: JSON.parse(m[1]), url: JSON.parse(m[2]), dir: m[3] === '1', modified: Number(m[5]) * 1000 }));
async function readFileUrl(url) {
  const res = await fetch(url);
  if (!res.ok && res.status !== 0) throw new Error('not found'); // file:// answers with status 0
  return res.text();
}
async function findArcSidebar() {
  if (!ARC_AUTO) return { status: 'unsupported' };
  if (!(await chrome.extension.isAllowedFileSchemeAccess())) return { status: 'needs-access' };
  const found = [];
  for (const root of ['file:///Users/', 'file:///home/']) {
    let users = [];
    try { users = fileRows(await readFileUrl(root)).filter((r) => r.dir && !/^(\.|Shared$|Guest$)/.test(r.name)); } catch (_) { continue; }
    for (const u of users) {
      const dir = root + encodeURIComponent(u.name) + '/' + ARC_DIR.split('/').map(encodeURIComponent).join('/');
      try {
        const row = fileRows(await readFileUrl(dir)).find((r) => r.name === 'StorableSidebar.json');
        if (row) found.push({ url: dir + 'StorableSidebar.json', modified: row.modified });
      } catch (_) { /* no Arc for this account, or no access */ }
    }
  }
  if (!found.length) return { status: 'missing' };
  found.sort((a, b) => b.modified - a.modified);
  try { return { status: 'found', text: await readFileUrl(found[0].url), modified: found[0].modified }; } catch (_) { return { status: 'missing' }; }
}

function arcImportDialog() {
  const st = { step: 'intro', auto: { status: ARC_AUTO ? 'checking' : 'unsupported' } };
  const path = '~/Library/Application Support/Arc/';
  let redrawRef = null;
  const recheck = async () => {
    st.auto = await findArcSidebar().catch(() => ({ status: 'missing' }));
    if (redrawRef) redrawRef();
  };
  recheck();
  dialog('Import from Arc', (redraw) => {
    redrawRef = redraw;
    const useText = (text) => {
      try {
        st.parsed = parseArcSidebar(JSON.parse(text));
        st.replace = S.spaces.every((x) => !x.items.length);
        st.openFavorites = true;
        st.step = 'preview';
        st.error = null;
      } catch (err) { st.error = err.message || 'Couldn’t read that file.'; }
      redraw();
    };
    const choose = () => pickFile(async (file) => useText(await file.text()));
    if (st.step === 'preview') {
      const { stats, spaces, favorites } = st.parsed;
      return [
        h('div', { class: 'chips' }, spaces.map((x) => h('span', { class: 'chip' }, `${x.emoji ? x.emoji + ' ' : ''}${x.name}`))),
        h('p', { class: 'dim' }, `${plural(stats.links, 'pinned tab')} · ${plural(stats.folders, 'folder')} · ${plural(stats.favorites, 'favorite')}`),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.replace, onchange: (e) => { st.replace = e.target.checked; } }), 'Replace my current spaces'),
        favorites.length ? h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.openFavorites, onchange: (e) => { st.openFavorites = e.target.checked; } }), 'Open favorites') : null,
        h('div', { class: 'actions' },
          h('button', { onclick: closeModal }, 'Cancel'),
          h('button', {
            class: 'primary',
            onclick: async () => {
              await send('importArc', { spaces, favorites, replace: st.replace, openFavorites: st.openFavorites });
              closeModal();
              toast(`Imported ${plural(stats.spaces, 'space')}`);
            },
          }, 'Import')),
      ];
    }
    const a = st.auto;
    const manual = h('ol', { class: 'steps' },
      h('li', {}, 'Click ', h('b', {}, 'Choose file')),
      h('li', {}, 'Press ', h('kbd', {}, '⇧⌘G'), ' and paste ',
        h('button', { class: 'path', title: 'Copy path', onclick: () => copyUrl(path).then(() => toast('Path copied')) }, path)),
      h('li', {}, 'Open ', h('b', {}, 'StorableSidebar.json')));
    const cancel = h('button', { onclick: closeModal }, 'Cancel');
    if (a.status === 'found') {
      return [
        h('div', { class: 'arc-found' }, h('b', {}, 'Found your Arc sidebar'), h('span', { class: 'dim' }, `Last saved ${ago(new Date(a.modified).toISOString())}`)),
        h('p', { class: 'dim' }, 'Quit Arc first if it’s open, so the newest changes are saved. ',
          h('button', { class: 'textlink', onclick: choose }, 'Choose a different file')),
        st.error ? h('p', { class: 'err' }, st.error) : null,
        h('div', { class: 'actions' },
          cancel,
          h('button', { class: 'primary', onclick: () => useText(a.text) }, 'Continue')),
      ];
    }
    const top = a.status === 'checking' ? h('p', { class: 'dim' }, 'Looking for Arc…')
      : a.status === 'needs-access' ? h('div', { class: 'arc-auto' },
        h('p', {}, h('b', {}, 'Let Arch find it for you. '), 'Turn on ', h('b', {}, 'Allow access to file URLs'), ' for Arch, then open Import from Arc again. Chrome reloads Arch when you flip the switch.'),
        h('button', { onclick: async () => {
          await chrome.storage.local.set({ arcImportPending: Date.now() });
          chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
        } }, 'Open Arch’s settings in Chrome'),
        h('p', { class: 'dim or' }, 'Or choose the file yourself:'))
      : a.status === 'missing' ? h('p', { class: 'dim' }, 'Arch couldn’t find Arc’s file on this Mac. You can still choose it yourself:')
      : null;
    return [
      top,
      manual,
      st.error ? h('p', { class: 'err' }, st.error) : null,
      h('div', { class: 'actions' }, cancel, h('button', { class: 'primary', onclick: choose }, 'Choose file')),
    ];
  });
}

function restoreDialog() {
  pickFile(async (file) => {
    let data, err;
    try {
      data = JSON.parse(await file.text());
      if (data.app !== 'Arch' || !Array.isArray(data.spaces)) throw new Error('That isn’t an Arch backup file.');
    } catch (e) { err = e.message || 'Couldn’t read that file.'; }
    dialog('Restore backup', () => {
      if (err) return [h('p', { class: 'err' }, err), h('div', { class: 'actions' }, h('button', { class: 'primary', onclick: closeModal }, 'OK'))];
      const c = countBackup(data);
      const when = data.exportedAt ? new Date(data.exportedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
      return [
        h('div', { class: 'chips' }, data.spaces.map((x) => h('span', { class: 'chip' }, `${x.emoji ? x.emoji + ' ' : ''}${x.name}`))),
        h('p', { class: 'dim' }, `${plural(c.links, 'pinned tab')} · ${plural(c.folders, 'folder')} · ${plural(c.favorites, 'favorite')}${when ? ` · saved ${when}` : ''}`),
        h('p', { class: 'warn' }, 'This replaces your current spaces.'),
        h('div', { class: 'actions' },
          h('button', { onclick: closeModal }, 'Cancel'),
          h('button', {
            class: 'primary',
            onclick: async () => {
              const res = await send('restoreBackup', { data });
              closeModal();
              toast(res && res.ok ? 'Backup restored' : ((res && res.error) || 'Restore failed').replace(/^Error: /, ''), [], 2600);
            },
          }, 'Restore')),
      ];
    });
  });
}

// ---------- sync ----------

function syncSubtitle() {
  if (!S.settings.syncEnabled) return 'Spaces, pins and folders';
  const st = S.syncStatus;
  if (st && st.error === 'too-big') return 'Too many pins to sync';
  if (st && st.at) return `Synced ${ago(new Date(st.at).toISOString())}`;
  return 'Waiting for first sync…';
}

async function toggleSync(on) {
  if (!on) { await send('setSync', { enabled: false }); toast('Sync turned off'); return; }
  const res = await send('syncCheck');
  const remote = res && res.result && res.result.remote;
  if (!remote) {
    const r = await send('setSync', { enabled: true, choice: 'local' });
    toast(r && r.result && r.result.error === 'too-big' ? 'Too many pins to sync' : 'Sync is on');
    return;
  }
  dialog('Sync across computers', () => [
    h('p', {}, 'Another computer already synced these spaces. Keep this computer’s, or use the synced ones?'),
    h('div', { class: 'chips' }, remote.spaces.map((x) => h('span', { class: 'chip' }, `${x.emoji ? x.emoji + ' ' : ''}${x.name}`))),
    h('p', { class: 'dim' }, `${plural(remote.links, 'pinned tab')} · updated ${ago(new Date(remote.updatedAt).toISOString())}`),
    h('div', { class: 'actions' },
      h('button', { onclick: async () => { closeModal(); await send('setSync', { enabled: true, choice: 'local' }); toast('Synced this computer’s spaces'); } }, 'Keep mine'),
      h('button', { class: 'primary', onclick: async () => { closeModal(); await send('setSync', { enabled: true, choice: 'remote' }); toast('Synced spaces loaded'); } }, 'Use synced')),
  ]);
}

// ---------- one-time hints ----------
// Small tips for features you'd never find by accident. Each shows once; after you dismiss one,
// the next waits at least an hour so they never feel naggy.

const HINT_GAP = 60 * 60 * 1000;
const HINTS = {
  seen: new Set(), lastAt: 0, loaded: false,
  async load() {
    const { hints = {} } = await chrome.storage.local.get('hints');
    this.seen = new Set(hints.seen || []);
    this.lastAt = hints.lastAt || 0;
    this.loaded = true;
  },
  async dismiss(id) {
    this.seen.add(id);
    this.lastAt = Date.now();
    await chrome.storage.local.set({ hints: { seen: [...this.seen], lastAt: this.lastAt } });
  },
};

function pickHint(space, todayTabs) {
  if (!HINTS.loaded || S.view !== 'main') return null;
  if (Date.now() - HINTS.lastAt < HINT_GAP) return null;
  const cmd = (id) => { const c = (helpCommands || []).find((x) => x.name === id); return c && c.shortcut; };
  const dupes = (() => { const seen = new Set(); return todayTabs.some((t) => { const k = (t.url || '').split('#')[0]; if (seen.has(k)) return true; seen.add(k); return false; }); })();
  const looksFresh = S.spaces.length <= 2 && S.spaces.every((s) => !s.items.length);
  const list = [
    looksFresh && { id: 'arc', text: 'Coming from Arc? Bring over your spaces, pins and folders.', action: ['Import', () => arcImportDialog()] },
    cmd('command-bar') && { id: 'command', text: `Press ${cmd('command-bar')} to search tabs, pins and history, or run actions.` },
    todayTabs.length >= 3 && { id: 'peek', text: '⇧-click any link to open it in Peek, a floating window.' },
    dupes && { id: 'tidy', text: 'You have duplicate tabs. Hover the line above your tabs and click Tidy.' },
    todayTabs.length >= 6 && { id: 'select', text: '⌘-click a few tabs, then right-click › Group into folder.' },
    { id: 'tips', text: 'See everything Arch can do in Settings › Tips & shortcuts.', action: ['Open', () => { S.view = 'help'; render(); }] },
  ].filter(Boolean);
  return list.find((x) => !HINTS.seen.has(x.id)) || null;
}

function renderHint(hint) {
  if (!hint) return null;
  const close = async () => { await HINTS.dismiss(hint.id); render(); };
  return h('div', { class: 'hint' },
    h('span', { class: 'hint-ic' }, '\u{1F4A1}'),
    h('span', { class: 'hint-text' }, hint.text),
    hint.action ? h('button', { class: 'hint-act', onclick: async () => { await HINTS.dismiss(hint.id); hint.action[1](); render(); } }, hint.action[0]) : null,
    h('button', { class: 'hint-x', title: 'Got it', html: ICON.x, onclick: close }));
}

// ---------- tips & shortcuts ----------

let helpCommands = null;
async function loadHelpCommands() { helpCommands = await chrome.commands.getAll(); render(); }

function keyCaps(shortcut) {
  const caps = archKeyCaps(shortcut);
  if (!caps.length) return h('span', { class: 'unset' }, 'Not set');
  return h('span', { class: 'kc' }, caps.map((c) => h('kbd', {}, c)));
}

function renderHelp() {
  if (!helpCommands) loadHelpCommands();
  const q = (S.helpQuery || '').toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);
  const hit = (f) => !words.length || words.every((w) => [f.title, f.short, ...f.how].join(' ').toLowerCase().includes(w));
  const feats = ARCH_FEATURES.filter(hit);
  S.helpOpen = S.helpOpen || new Set();

  const search = h('input', {
    class: 'search', placeholder: 'Search tips', value: S.helpQuery || '',
    oninput: (e) => { S.helpQuery = e.target.value; render(); },
  });
  if (document.activeElement && document.activeElement.classList.contains('search')) {
    setTimeout(() => { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }, 0);
  }

  const shortcutRows = Object.entries(ARCH_COMMAND_NAMES)
    .filter(([, label]) => !words.length || words.every((w) => label.toLowerCase().includes(w) || 'shortcut keyboard'.includes(w)))
    .map(([name, label]) => {
      const c = (helpCommands || []).find((x) => x.name === name);
      return h('div', { class: 'srow' }, h('span', { class: 'stext' }, h('span', { class: 'stitle' }, label)), keyCaps(c && c.shortcut));
    });

  return h('div', { class: 'settings-view' },
    h('div', { class: 'view-head' },
      h('button', { class: 'icon-btn', html: ICON.back, title: 'Back to settings', onclick: () => { S.view = 'settings'; render(); } }),
      h('h2', {}, 'Tips & shortcuts')),
    search,
    h('div', { class: 'scroll' },
      feats.length ? sgroup('Features', ...feats.map((f) => {
        const open = S.helpOpen.has(f.id) || words.length > 0;
        return h('div', { class: `tip${open ? ' open' : ''}` },
          h('button', {
            class: 'tip-head',
            onclick: () => { if (S.helpOpen.has(f.id)) S.helpOpen.delete(f.id); else S.helpOpen.add(f.id); render(); },
          },
          h('span', { class: 'tip-ic' }, f.icon),
          h('span', { class: 'stext' }, h('span', { class: 'stitle' }, f.title), h('span', { class: 'ssub' }, f.short)),
          h('span', { class: 'schev', html: ICON.chev })),
          open ? h('ul', { class: 'tip-how' }, f.how.map((line) => h('li', {}, line))) : null);
      })) : null,
      shortcutRows.length ? sgroup('Keyboard shortcuts', ...shortcutRows,
        h('button', { class: 'srow link', onclick: () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }) },
          h('span', { class: 'stext' }, h('span', { class: 'stitle', style: 'color:var(--accent-strong)' }, 'Change shortcuts…')))) : null,
      !feats.length && !shortcutRows.length ? h('div', { class: 'empty', style: 'text-align:center;padding:24px' }, 'No tips match') : null));
}

function renderSettings() {
  const save = (patch) => chrome.storage.local.set({ settings: { ...S.settings, ...patch } });
  const archiveSelect = h('select', { class: 'sselect', onchange: (e) => save({ archiveAfterHours: Number(e.target.value) }) },
    ARCHIVE_OPTIONS.map(([v, label]) => h('option', { value: String(v), selected: Number(S.settings.archiveAfterHours) === v }, label.replace(/^After /, ''))));

  const bgKey = darkQuery.matches ? 'panelBgDark' : 'panelBg';
  const bgValue = S.settings[bgKey] || (bgKey === 'panelBg' ? '#f9f9ff' : '#1f1f23');
  const setBg = (hex) => save({ [bgKey]: hex.toLowerCase() });
  const bgControl = h('span', { class: 'sctl' },
    'EyeDropper' in window ? h('button', {
      class: 'mini', title: 'Pick Chrome’s frame color from the screen',
      onclick: async () => { try { setBg((await new EyeDropper().open()).sRGBHex); } catch (_) { /* cancelled */ } },
    }, 'Pick') : null,
    h('label', { class: 'swatch-in', style: `background:${bgValue}`, title: bgValue.toUpperCase() },
      h('input', { type: 'color', value: bgValue, onchange: (e) => setBg(e.target.value) })));

  const archived = S.archive.length;
  return h('div', { class: 'settings-view' },
    h('div', { class: 'view-head' },
      h('button', { class: 'icon-btn', html: ICON.back, title: 'Back', onclick: () => { S.view = 'main'; render(); } }),
      h('h2', {}, 'Settings')),
    h('div', { class: 'scroll' },
      sgroup('',
        srow({ icon: 'help', title: 'Tips & shortcuts', sub: 'Everything Arch can do', onclick: () => { S.view = 'help'; S.helpQuery = ''; render(); } }),
        srow({ icon: 'keys', title: 'Keyboard shortcuts', sub: 'Change them in Chrome', onclick: () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }) })),
      sgroup('Tabs',
        srow({ icon: 'archive', title: 'Archive unused tabs', sub: 'Pins and favorites are kept', control: archiveSelect, tip: 'Pinned tabs, favorites and tabs playing audio are never archived.' }),
        srow({ icon: 'list', title: 'Archived tabs', control: h('span', { class: 'sctl' }, archived ? h('span', { class: 'count' }, archived) : null, h('span', { class: 'schev', html: ICON.chev })), onclick: () => { S.view = 'archive'; render(); } }),
        srow({ icon: 'broom', title: 'Clean up now', control: null, onclick: async () => { await send('archiveNow'); toast('Old tabs archived'); } })),
      sgroup('Appearance',
        srow({ icon: 'palette', title: 'Space color background', control: toggle(!!S.settings.tintBackground, (v) => save({ tintBackground: v })) }),
        S.settings.tintBackground ? null : srow({ icon: 'drop', title: 'Sidebar color', sub: darkQuery.matches ? 'Dark mode' : 'Match Chrome’s frame', control: bgControl })),
      sgroup('Links',
        srow({ icon: 'peek', title: 'Peek', sub: 'Open links in a floating window', tip: 'Also in the right-click menu on any link: Open link in Peek.',
          control: h('select', { class: 'sselect', onchange: (e) => save({ peekTrigger: e.target.value }) },
            [['shift', '\u21e7 Click'], ['alt', '\u2325 Click'], ['off', 'Off']].map(([v, label]) => h('option', { value: v, selected: (S.settings.peekTrigger || 'shift') === v }, label))) })),
      sgroup('Media',
        srow({ icon: 'pip', title: 'Auto picture-in-picture', sub: 'Float videos when you switch tabs', control: toggle(!!S.settings.autoPip, (v) => save({ autoPip: v })),
          tip: 'Chrome may ask once per site. Reload tabs that were open before turning this on.' })),
      sgroup('Data',
        srow({ icon: 'sync', title: 'Sync across computers', sub: syncSubtitle(),
          tip: 'Uses your Chrome account. Syncs spaces, pins, folders and these settings. Favorites and open tabs stay per computer.',
          control: toggle(!!S.settings.syncEnabled, (v) => toggleSync(v)) }),
        srow({ icon: 'arc', title: 'Import from Arc', onclick: arcImportDialog }),
        srow({ icon: 'export', title: 'Export backup', control: null, onclick: exportBackup }),
        srow({ icon: 'restore', title: 'Restore backup', onclick: restoreDialog })),
      sgroup('About',
        srow({ icon: 'welcome', title: 'Welcome page', onclick: () => chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') }) })),
      h('div', { class: 'about' },
        h('img', { src: 'icons/32.png', alt: '' }),
        h('span', {}, `Arch ${chrome.runtime.getManifest().version}`))));
}

function renderDock(space) {
  return h('div', { class: 'dock' },
    h('div', { class: 'dock-side' },
      h('button', { class: `icon-btn${S.view !== 'main' ? ' on' : ''}`, title: 'Settings', html: ICON.gear, onclick: () => { S.view = S.view === 'main' ? 'settings' : 'main'; render(); } }),
      h('button', { class: `icon-btn dl-btn${DL.open ? ' on' : ''}${DL.unseen ? ' unseen' : ''}`, title: 'Downloads', html: DL_ICON.tray, onclick: async (e) => {
          e.stopPropagation();
          const btn = e.currentTarget;
          if (!PERMS.downloads) {
            const ok = await chrome.permissions.request({ permissions: ['downloads', 'downloads.open'] }).catch(() => false);
            if (!ok) { toast('The downloads tray needs permission to list your downloads', [], 2600); return; }
            PERMS.downloads = true;
            dlInit();
          }
          await dlToggle();
          btn.classList.toggle('on', DL.open);
        } })),
    h('div', { class: 'spaces' }, S.spaces.map((s) => {
      const b = h('button', {
        class: `space-dot${s.id === space.id ? ' active' : ''}`, title: s.name,
        onclick: () => { S.view = 'main'; if (s.id !== space.id) switchTo(s.id); else render(); },
        ondblclick: () => spaceModal(s),
        oncontextmenu: (e) => showMenu(e, spaceMenuEntries(s)),
      }, s.emoji ? h('span', { class: 'emo' }, s.emoji) : h('span', { class: 'dot', style: `background:${tintOf(s)}` }));
      makeZone(b, (d) => send('moveTabToSpace', { tabId: d.tabId, spaceId: s.id }), (d) => d.kind === 'tab' && s.id !== space.id);
      return b;
    })),
    h('div', { class: 'dock-side end' }, h('button', {
      class: 'icon-btn', title: 'New…', html: ICON.plus,
      onclick: (e) => showMenu(e, [
        { label: 'New tab', run: () => { S.view = 'main'; send('newTab'); } },
        { label: 'New folder', run: () => { S.view = 'main'; newFolder(); } },
        { label: 'New space', run: () => spaceModal(null) },
      ]),
    })));
}

function looksLikeUrl(text) {
  return /^[a-z]+:\/\//i.test(text) || /^localhost(:\d+)?(\/|$)/i.test(text)
    || (!/\s/.test(text) && /^[^\s]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(text));
}

function go(text) {
  const tabId = activeTabId();
  text = text.trim();
  if (!text || tabId == null) return;
  if (looksLikeUrl(text)) {
    const url = /^[a-z]+:\/\//i.test(text) ? text : (/^localhost/i.test(text) ? 'http://' : 'https://') + text;
    chrome.tabs.update(tabId, { url });
  } else {
    chrome.search.query({ text, tabId });
  }
}

function renderTop() {
  const tab = S.tabs.find((t) => t.active);
  const url = tab ? tab.url || tab.pendingUrl || '' : '';
  let host = '';
  try { const u = new URL(url); host = /^https?:$/.test(u.protocol) ? u.hostname.replace(/^www\./, '') : url; } catch (_) { host = url; }
  if (/^chrome:\/\/newtab/.test(url)) host = '';

  const pill = S.urlEditing
    ? h('input', {
        class: 'url-pill editing', value: url.startsWith('chrome://newtab') ? '' : url, placeholder: 'Search or enter URL',
        onkeydown: (e) => {
          if (e.key === 'Enter') { S.urlEditing = false; go(e.target.value); render(); }
          if (e.key === 'Escape') { S.urlEditing = false; render(); }
          e.stopPropagation();
        },
        onblur: () => { if (S.urlEditing) { S.urlEditing = false; render(); } },
      })
    : h('div', { class: 'url-wrap' },
        h('button', { class: 'url-pill', title: url, onclick: () => { S.urlEditing = true; render(); } },
          host || h('span', { class: 'placeholder' }, 'Search or enter URL')),
        host ? h('button', {
          class: 'pill-copy', title: 'Copy URL', html: ICON.link,
          onclick: async (e) => {
            const btn = e.currentTarget;
            if (await copyUrl(url)) { btn.innerHTML = ICON.check; btn.classList.add('done'); setTimeout(() => { btn.innerHTML = ICON.link; btn.classList.remove('done'); }, 1200); }
          },
        }) : null,
        host ? h('button', {
          class: 'pill-copy pill-shot', title: 'Full-page screenshot', html: ICON.shot,
          onclick: (e) => takeScreenshot(e.currentTarget),
        }) : null);
  if (S.urlEditing) setTimeout(() => { pill.focus(); pill.select(); }, 0);

  return h('div', { class: 'top' }, pill);
}

// ---------- downloads tray ----------
// Recent downloads above the dock. Drag a file out into any app, click to open, right-click for more.

const DL = { open: false, unseen: false, items: [], icons: new Map(), timer: null, el: null, seenIds: new Set(), ready: false };
const DL_ICON = {
  tray: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5v7M5 6.8l3 3 3-3"/><path d="M2.5 10.5v2a1 1 0 001 1h9a1 1 0 001-1v-2"/></svg>',
  folder: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2L13.5 13.5"/></svg>',
};

const baseName = (p) => (p || '').split(/[\\/]/).pop();
// Name to show for a download: the saved file's name, or the link's name if the file was saved under a temporary id.
function dlName(d) {
  const name = baseName(d.filename);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name)) return name;
  try { return decodeURIComponent(new URL(d.finalUrl || d.url).pathname.split('/').pop()) || name; } catch (_) { return name; }
}
function fmtBytes(n) {
  if (!n || n < 0) return '';
  const u = ['B', 'KB', 'MB', 'GB']; let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n < 10 && i ? n.toFixed(1) : Math.round(n)} ${u[i]}`;
}
function ago(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

async function dlLoad() {
  if (!PERMS.downloads || !chrome.downloads) { DL.items = []; return; }
  const items = await chrome.downloads.search({ orderBy: ['-startTime'], limit: 20 });
  DL.items = items.filter((d) => d.filename && !(d.state === 'complete' && d.exists === false)).slice(0, 8);
  for (const d of DL.items) {
    if (!DL.icons.has(d.id) && d.state === 'complete') {
      chrome.downloads.getFileIcon(d.id, { size: 32 }).then((url) => { DL.icons.set(d.id, url); dlDraw(); }).catch(() => {});
    }
  }
  if (!DL.ready) { DL.items.forEach((d) => DL.seenIds.add(d.id)); DL.ready = true; }
  const active = DL.items.some((d) => d.state === 'in_progress');
  clearInterval(DL.timer);
  if (active && DL.open) DL.timer = setInterval(() => dlLoad().then(dlDraw), 1000);
}

function dlRow(d) {
  const done = d.state === 'complete';
  const pct = d.totalBytes > 0 ? Math.round((d.bytesReceived / d.totalBytes) * 100) : 0;
  const status = done ? `${fmtBytes(d.fileSize || d.totalBytes)} · ${ago(d.endTime || d.startTime)}`
    : d.state === 'in_progress' ? (d.paused ? 'Paused' : `${pct}% · ${fmtBytes(d.bytesReceived)} of ${fmtBytes(d.totalBytes)}`)
    : (d.error === 'USER_CANCELED' ? 'Canceled' : 'Failed');
  const icon = DL.icons.get(d.id);
  const row = h('div', {
    class: `dl-row${done ? '' : ' pending'}`, title: done ? 'Click to open, or drag into another app' : '', draggable: done ? 'true' : 'false',
    onclick: () => { if (done) chrome.downloads.open(d.id); },
    ondragstart: (e) => { if (!done) return; e.preventDefault(); chrome.downloads.drag(d.id); },
    oncontextmenu: (e) => showMenu(e, [
      done && { label: 'Open', run: () => chrome.downloads.open(d.id) },
      done && { label: 'Show in Finder', run: () => chrome.downloads.show(d.id) },
      d.state === 'in_progress' && { label: d.paused ? 'Resume' : 'Pause', run: () => (d.paused ? chrome.downloads.resume(d.id) : chrome.downloads.pause(d.id)).then(() => dlLoad().then(dlDraw)) },
      d.state === 'in_progress' && { label: 'Cancel', run: () => chrome.downloads.cancel(d.id).then(() => dlLoad().then(dlDraw)) },
      { label: 'Copy download link', run: () => copyUrl(d.finalUrl || d.url) },
      '-',
      { label: 'Remove from list', run: () => chrome.downloads.erase({ id: d.id }).then(() => dlLoad().then(dlDraw)) },
      done && { label: 'Delete file', danger: true, run: () => chrome.downloads.removeFile(d.id).then(() => chrome.downloads.erase({ id: d.id })).then(() => dlLoad().then(dlDraw)) },
    ]),
  },
  h('span', { class: 'dl-icon' }, icon ? h('img', { src: icon, alt: '' }) : h('span', { html: DL_ICON.tray })),
  h('span', { class: 'dl-text' },
    h('span', { class: 'dl-name' }, dlName(d)),
    h('span', { class: 'dl-sub' }, status),
    d.state === 'in_progress' ? h('span', { class: 'dl-bar' }, h('span', { style: `width:${pct}%` })) : null),
  done ? h('button', { class: 'dl-show', title: 'Show in Finder', html: DL_ICON.folder, onclick: (e) => { e.stopPropagation(); chrome.downloads.show(d.id); } }) : null);
  return row;
}

function dlDraw() {
  if (!DL.el) DL.el = h('div', { class: 'dl-pop' });
  DL.el.hidden = !DL.open;
  // Sit above the Now Playing card instead of covering it.
  const np = document.querySelector('.now-playing');
  const dock = document.querySelector('.dock');
  const below = (dock ? dock.offsetHeight : 40) + (np && !np.hidden ? np.offsetHeight : 0) + 6;
  DL.el.style.bottom = `${below}px`;
  DL.el.innerHTML = '';
  DL.el.append(
    h('div', { class: 'dl-head' },
      h('span', {}, 'Downloads'),
      h('button', { class: 'dl-all', onclick: () => chrome.tabs.create({ url: 'chrome://downloads' }) }, 'Show all')),
    DL.items.length ? h('div', { class: 'dl-list' }, DL.items.map(dlRow)) : h('div', { class: 'dl-empty' }, 'No recent downloads'));
  const btn = document.querySelector('.dock .dl-btn');
  if (btn) btn.classList.toggle('unseen', DL.unseen);
}

async function dlToggle(force) {
  DL.open = force ?? !DL.open;
  if (DL.open) { DL.unseen = false; const t = document.getElementById('toast'); if (t) t.classList.remove('show'); await dlLoad(); }
  else clearInterval(DL.timer);
  dlDraw();
}

let dlListening = false;
function dlInit() {
  if (dlListening || !PERMS.downloads || !chrome.downloads) return;
  dlListening = true;
  dlLoad().then(dlDraw);
  chrome.downloads.onCreated.addListener(() => dlLoad().then(dlDraw));
  chrome.downloads.onErased.addListener(() => dlLoad().then(dlDraw));
  chrome.downloads.onChanged.addListener(async (delta) => {
      await dlLoad();
      if (delta.state && delta.state.current === 'complete' && !DL.seenIds.has(delta.id)) {
        DL.seenIds.add(delta.id);
        const d = DL.items.find((x) => x.id === delta.id);
        if (!DL.open) DL.unseen = true;
        if (d) toast(`Downloaded ${dlName(d)}`, [
          { label: 'Open', run: () => { chrome.downloads.open(d.id); return false; } },
          { label: 'Show', run: () => { chrome.downloads.show(d.id); return false; } },
        ]);
      }
      dlDraw();
    });
}

function downloadsNode() {
  if (!DL.el) {
    dlDraw();
    dlInit();
    document.addEventListener('click', (e) => {
      if (DL.open && !e.target.closest('.dl-pop, .dl-btn, .menu')) dlToggle(false);
    });
  }
  return DL.el;
}

// ---------- now playing ----------
// A mini player for media in tabs you're not looking at. The background remembers which tabs have
// played sound; this panel asks those tabs what they're playing about once a second while visible.

const NP_ICON = {
  play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.2v9.6a.6.6 0 00.9.5l7.6-4.8a.6.6 0 000-1L5.9 2.7a.6.6 0 00-.9.5z"/></svg>',
  pause: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="3" width="2.8" height="10" rx=".8"/><rect x="9.2" y="3" width="2.8" height="10" rx=".8"/></svg>',
  back: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.2 7.2A6.8 6.8 0 1 1 3.2 10.5"/><path d="M4 3.4v3.9h3.9"/><text x="10.4" y="13.1" font-size="6.6" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="-apple-system,system-ui,sans-serif">10</text></svg>',
  fwd: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15.8 7.2A6.8 6.8 0 1 0 16.8 10.5"/><path d="M16 3.4v3.9h-3.9"/><text x="9.6" y="13.1" font-size="6.6" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="-apple-system,system-ui,sans-serif">10</text></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
};

// Runs inside the page (all frames): describes the main media element, or acts on it.
function npPageProbe(action, value) {
  const all = [...document.querySelectorAll('video, audio')].filter((m) => m.currentSrc || m.srcObject || m.duration > 0);
  if (!all.length) return null;
  all.sort((a, b) => (Number(!b.paused) - Number(!a.paused)) || (b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight));
  const m = all[0];
  if (action === 'toggle') { if (m.paused) m.play().catch(() => {}); else m.pause(); }
  if (action === 'pause') m.pause();
  if (action === 'seekBy' && isFinite(m.duration)) m.currentTime = Math.max(0, Math.min(m.duration, m.currentTime + value));
  if (action === 'seekTo' && isFinite(m.duration)) m.currentTime = value * m.duration;
  const md = navigator.mediaSession && navigator.mediaSession.metadata;
  let art = null;
  if (md && md.artwork && md.artwork.length) {
    art = [...md.artwork].sort((a, b) => (parseInt(b.sizes, 10) || 0) - (parseInt(a.sizes, 10) || 0))[0].src;
  }
  return {
    title: (md && md.title) || '', artist: (md && (md.artist || md.album)) || '', art,
    paused: action === 'toggle' ? !m.paused : m.paused,
    time: m.currentTime || 0, duration: isFinite(m.duration) ? m.duration : 0,
    video: m.tagName === 'VIDEO', top: window === window.top,
  };
}

async function npQuery(tabId, action = null, value = 0) {
  try {
    const res = await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, func: npPageProbe, args: [action, value] });
    const hits = res.map((r) => r.result).filter(Boolean);
    hits.sort((a, b) => (Number(!b.paused) - Number(!a.paused)) || (Number(b.top) - Number(a.top)));
    return hits[0] || null;
  } catch (_) { return null; }
}

const NP = { el: null, state: new Map(), timer: null, busy: false };

async function npTabIds() {
  const { mediaTabs = [] } = await chrome.storage.session.get('mediaTabs');
  return mediaTabs;
}
async function npForget(tabId) {
  const { mediaTabs = [] } = await chrome.storage.session.get('mediaTabs');
  await chrome.storage.session.set({ mediaTabs: mediaTabs.filter((id) => id !== tabId) });
  NP.state.delete(tabId);
}

const fmtTime = (s) => { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; };

async function npPoll() {
  if (NP.busy || document.hidden) return;
  NP.busy = true;
  try {
    const ids = await npTabIds();
    const tabs = (await Promise.all(ids.map((id) => chrome.tabs.get(id).catch(() => null)))).filter(Boolean);
    for (const id of ids) if (!tabs.some((t) => t.id === id)) await npForget(id);
    for (const tab of tabs) {
      const info = await npQuery(tab.id);
      if (!info) { if (!tab.audible) await npForget(tab.id); continue; }
      NP.state.set(tab.id, { tab, info });
    }
    npDraw();
  } finally { NP.busy = false; }
}

async function npAct(tabId, action, value) {
  const info = await npQuery(tabId, action, value);
  const cur = NP.state.get(tabId);
  if (info && cur) { NP.state.set(tabId, { ...cur, info }); npDraw(); }
}

function npCard(tab, info) {
  const muted = !!(tab.mutedInfo && tab.mutedInfo.muted);
  let site = '';
  try { site = new URL(tab.url).hostname.replace(/^www\./, ''); } catch (_) { /* ignore */ }
  const title = info.title || tab.title || site;
  const sub = info.artist || site;
  const goTo = async () => { await chrome.tabs.update(tab.id, { active: true }); await chrome.windows.update(tab.windowId, { focused: true }); };
  const pct = info.duration ? Math.min(100, (info.time / info.duration) * 100) : 0;
  const bar = h('div', {
    class: 'np-bar', title: info.duration ? `${fmtTime(info.time)} / ${fmtTime(info.duration)}` : '',
    onclick: (e) => { const r = e.currentTarget.getBoundingClientRect(); npAct(tab.id, 'seekTo', (e.clientX - r.left) / r.width); },
  }, h('div', { class: 'np-fill', style: `width:${pct}%` }));
  const btn = (cls, title2, icon, fn) => h('button', { class: `np-btn ${cls}`, title: title2, html: icon, onclick: (e) => { e.stopPropagation(); fn(); } });
  return h('div', { class: 'np-card', 'data-tab': String(tab.id) },
    h('div', { class: 'np-top' },
      h('button', { class: 'np-art', title: 'Go to tab', onclick: goTo },
        info.art ? h('img', { src: info.art, alt: '' }) : h('img', { class: 'fav', src: faviconFor(tab.url, tab.favIconUrl), alt: '' })),
      h('button', { class: 'np-text', title: 'Go to tab', onclick: goTo },
        h('span', { class: 'np-title' }, title), h('span', { class: 'np-sub' }, sub)),
      btn('np-x', 'Stop and dismiss', NP_ICON.close, async () => { await npQuery(tab.id, 'pause'); await npForget(tab.id); npDraw(); })),
    info.duration ? bar : null,
    h('div', { class: 'np-controls' },
      btn('', muted ? 'Unmute' : 'Mute', muted ? ICON.muted : ICON.audio, () => chrome.tabs.update(tab.id, { muted: !muted }).then(npPoll)),
      h('span', { class: 'np-mid' },
        info.duration ? btn('np-skip', 'Back 10 seconds', NP_ICON.back, () => npAct(tab.id, 'seekBy', -10)) : null,
        btn('np-play', info.paused ? 'Play' : 'Pause', info.paused ? NP_ICON.play : NP_ICON.pause, () => npAct(tab.id, 'toggle')),
        info.duration ? btn('np-skip', 'Forward 10 seconds', NP_ICON.fwd, () => npAct(tab.id, 'seekBy', 10)) : null),
      h('span', { class: 'np-time' }, info.duration ? `-${fmtTime(info.duration - info.time)}` : '')));
}

function npDraw() {
  if (!NP.el) return;
  // Like Arc: only for tabs you aren't looking at right now.
  const activeId = (S.tabs.find((t) => t.active) || {}).id;
  const entries = [...NP.state.values()].filter(({ tab }) => !(tab.id === activeId && tab.windowId === S.windowId))
    .sort((a, b) => (Number(!b.info.paused) - Number(!a.info.paused)))
    .slice(0, 2);
  NP.el.innerHTML = '';
  NP.el.hidden = !entries.length || S.view !== 'main';
  for (const { tab, info } of entries) NP.el.append(npCard(tab, info));
}

function nowPlayingNode() {
  if (!NP.el) {
    NP.el = h('div', { class: 'now-playing' });
    NP.el.hidden = true;
    npPoll();
    NP.timer = setInterval(npPoll, 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) npPoll(); });
  }
  npDraw();
  return NP.el;
}

function render() {
  if (drag) { pendingRender = true; return; }
  const app = document.getElementById('app');
  const space = currentSpace();
  app.innerHTML = '';
  if (!space) { app.append(h('div', { class: 'empty', style: 'padding:20px' }, 'Setting up…')); return; }
  applyTheme(tintOf(space));

  if (S.view === 'archive') app.append(renderArchive());
  else if (S.view === 'settings') app.append(renderSettings());
  else if (S.view === 'help') app.append(renderHelp());
  else {
    app.append(renderTop());
    app.append(renderMain(space));
  }
  app.append(nowPlayingNode());
  app.append(downloadsNode());
  app.append(renderDock(space));
  dlDraw();
}

let timer = null;
function refresh() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    await load();
    // Don't rebuild the list under someone who is mid-rename; commit/cancel re-renders.
    if ((S.renaming && document.querySelector('input.rename')) || document.querySelector('input.url-pill')) return;
    render();
  }, 40);
}

(async function init() {
  const win = await chrome.windows.getCurrent();
  S.windowId = win.id;
  await loadPerms();
  await HINTS.load();
  helpCommands = await chrome.commands.getAll();
  const connect = () => {
    const port = chrome.runtime.connect({ name: `orbit-panel:${S.windowId}` });
    const beat = setInterval(() => { try { port.postMessage('ping'); } catch (_) { /* reconnecting */ } }, 20000);
    port.onMessage.addListener((m) => {
      if (m && m.type === 'close') window.close();
      if (m && m.type === 'newFolder') newFolderFromSelection();
      if (m && m.type === 'toast') toast(m.text);
    });
    port.onDisconnect.addListener(() => { clearInterval(beat); setTimeout(connect, 300); });
  };
  connect();
  await load();
  if (!S.favorites) { await send('favInit').catch(() => {}); await load(); } // first run: build the shared list from pinned tabs
  render();
  chrome.storage.local.get('arcImportPending').then(async ({ arcImportPending: t }) => {
    if (!t) return;
    await chrome.storage.local.remove('arcImportPending');
    if (Date.now() - t < 15 * 60 * 1000 && (await chrome.extension.isAllowedFileSchemeAccess())) { S.view = 'settings'; render(); arcImportDialog(); }
  });
  const ev = [
    chrome.tabs.onCreated, chrome.tabs.onRemoved, chrome.tabs.onUpdated, chrome.tabs.onActivated,
    chrome.tabs.onMoved, chrome.tabs.onAttached, chrome.tabs.onDetached, chrome.tabs.onReplaced,
    chrome.tabGroups.onCreated, chrome.tabGroups.onUpdated, chrome.tabGroups.onRemoved, chrome.tabGroups.onMoved,
    chrome.storage.onChanged,
  ];
  ev.forEach((e) => e.addListener(refresh));
})();
