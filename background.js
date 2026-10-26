// Arch background service worker.
// Spaces are backed by one Chrome tab group per space per window. Switching a space
// expands its group and collapses the others. Pinned items live in storage and are
// linked to open tabs through a session map.

const DEFAULT_SETTINGS = { archiveAfterHours: 12, autoPip: true, peekTrigger: 'shift', tintBackground: false, panelBg: '#f9f9ff', panelBgDark: '#1f1f23' };
const ARCHIVE_LIMIT = 500;

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const groupTitle = (s) => (s.emoji ? `${s.emoji} ${s.name}` : s.name);

function defaultSpaces() {
  return [
    { id: uid(), name: 'Personal', emoji: '🏠', color: 'purple', tint: '#a98bd6', items: [] },
    { id: uid(), name: 'Work', emoji: '💼', color: 'blue', tint: '#8fa3dc', items: [] },
  ];
}

function sameUrl(a, b) {
  if (!a || !b) return false;
  const norm = (u) => u.split('#')[0].replace(/\/$/, '');
  return norm(a) === norm(b);
}

function walkLinks(items, cb) {
  for (const it of items || []) {
    if (it.type === 'folder') walkLinks(it.children, cb);
    else cb(it);
  }
}

function findItem(items, id) {
  for (const it of items || []) {
    if (it.id === id) return it;
    if (it.type === 'folder') {
      const r = findItem(it.children, id);
      if (r) return r;
    }
  }
  return null;
}

// Everything that touches groups or storage runs one at a time to avoid races
// between tab events and sidebar commands.
let chain = Promise.resolve();
function serial(fn) {
  const run = chain.then(() => fn());
  chain = run.catch((e) => console.warn('[orbit]', e));
  return run;
}

async function local() {
  const s = await chrome.storage.local.get(['spaces', 'archive', 'settings']);
  return {
    spaces: s.spaces || [],
    archive: s.archive || [],
    settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) },
  };
}

async function session() {
  const s = await chrome.storage.session.get(['pinnedTabs', 'activeSpace', 'groupIds']);
  return { pinnedTabs: s.pinnedTabs || {}, activeSpace: s.activeSpace || {}, groupIds: s.groupIds || {} };
}

async function patchSession(key, fn) {
  const cur = (await chrome.storage.session.get(key))[key] || {};
  const next = fn({ ...cur });
  await chrome.storage.session.set({ [key]: next });
  return next;
}

// ---------- groups <-> spaces ----------

async function findGroup(windowId, space) {
  const { groupIds } = await session();
  const key = `${windowId}:${space.id}`;
  const gid = groupIds[key];
  if (gid != null) {
    const g = await chrome.tabGroups.get(gid).catch(() => null);
    if (g && g.windowId === windowId) return g;
  }
  const groups = await chrome.tabGroups.query({ windowId });
  const g = groups.find((x) => x.title === groupTitle(space)) || null;
  if (g) await patchSession('groupIds', (m) => ({ ...m, [key]: g.id }));
  return g;
}

async function spaceForGroup(groupId, spaces) {
  if (groupId == null || groupId === -1) return null;
  const { groupIds } = await session();
  for (const [k, v] of Object.entries(groupIds)) {
    if (v === groupId) {
      const s = spaces.find((x) => x.id === k.split(':')[1]);
      if (s) return s;
    }
  }
  const g = await chrome.tabGroups.get(groupId).catch(() => null);
  return g ? spaces.find((s) => groupTitle(s) === g.title) || null : null;
}

async function addTabsToSpace(tabIds, windowId, space) {
  tabIds = tabIds.filter((x) => x != null);
  if (!tabIds.length || !space) return null;
  const g = await findGroup(windowId, space);
  if (g) {
    await chrome.tabs.group({ groupId: g.id, tabIds });
    return g.id;
  }
  const gid = await chrome.tabs.group({ tabIds, createProperties: { windowId } });
  await chrome.tabGroups.update(gid, { title: groupTitle(space), color: space.color, collapsed: false });
  await patchSession('groupIds', (m) => ({ ...m, [`${windowId}:${space.id}`]: gid }));
  return gid;
}

async function getActiveSpace(windowId, spaces) {
  const { activeSpace } = await session();
  return spaces.find((s) => s.id === activeSpace[windowId]) || spaces[0] || null;
}

async function setActiveSpace(windowId, spaceId) {
  await patchSession('activeSpace', (m) => ({ ...m, [windowId]: spaceId }));
}

async function collapseOthers(windowId, activeId, spaces) {
  const groups = await chrome.tabGroups.query({ windowId });
  for (const g of groups) {
    const s = await spaceForGroup(g.id, spaces);
    if (!s) continue;
    const shouldCollapse = s.id !== activeId;
    if (g.collapsed !== shouldCollapse) {
      await chrome.tabGroups.update(g.id, { collapsed: shouldCollapse }).catch(() => {});
    }
  }
}

async function switchSpace(windowId, spaceId) {
  const { spaces } = await local();
  const space = spaces.find((s) => s.id === spaceId);
  if (!space) return;
  await setActiveSpace(windowId, spaceId);
  const g = await findGroup(windowId, space);
  let target = null;
  if (g) {
    const tabs = await chrome.tabs.query({ windowId, groupId: g.id });
    tabs.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    target = tabs[0] || null;
  }
  if (target) {
    await chrome.tabs.update(target.id, { active: true });
  } else {
    const t = await chrome.tabs.create({ windowId, active: true });
    await addTabsToSpace([t.id], windowId, space);
  }
  await collapseOthers(windowId, spaceId, spaces);
}

// New tabs join whichever space is active in their window.
async function adopt(tabId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab || tab.pinned || tab.groupId !== -1) return;
  const win = await chrome.windows.get(tab.windowId).catch(() => null);
  if (!win || win.type !== 'normal') return;
  const { spaces } = await local();
  const s = await getActiveSpace(tab.windowId, spaces);
  if (s) await addTabsToSpace([tab.id], tab.windowId, s);
}

// ---------- pinned items ----------

async function openItem(windowId, itemId) {
  const { spaces } = await local();
  let item = null;
  let space = null;
  for (const s of spaces) {
    item = findItem(s.items, itemId);
    if (item) { space = s; break; }
  }
  if (!item || item.type !== 'link') return;

  const { pinnedTabs } = await session();
  let tab = pinnedTabs[itemId] != null ? await chrome.tabs.get(pinnedTabs[itemId]).catch(() => null) : null;
  if (!tab) {
    const mapped = new Set(Object.values(pinnedTabs));
    const inWindow = await chrome.tabs.query({ windowId });
    tab = inWindow.find((t) => !mapped.has(t.id) && sameUrl(t.url || t.pendingUrl, item.url)) || null;
  }
  if (!tab) tab = await chrome.tabs.create({ windowId, url: item.url, active: true });

  await patchSession('pinnedTabs', (m) => ({ ...m, [itemId]: tab.id }));
  if (tab.windowId === windowId && !tab.pinned) {
    const g = await findGroup(windowId, space);
    if (!g || tab.groupId !== g.id) await addTabsToSpace([tab.id], windowId, space);
  }
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true });
}

async function relinkPinned() {
  const { spaces } = await local();
  const tabs = await chrome.tabs.query({});
  const { pinnedTabs } = await session();
  const alive = new Set(tabs.map((t) => t.id));
  const next = {};
  for (const [k, v] of Object.entries(pinnedTabs)) if (alive.has(v)) next[k] = v;
  const used = new Set(Object.values(next));
  for (const s of spaces) {
    walkLinks(s.items, (item) => {
      if (next[item.id] != null) return;
      const t = tabs.find((x) => !used.has(x.id) && sameUrl(x.url, item.url));
      if (t) { next[item.id] = t.id; used.add(t.id); }
    });
  }
  await chrome.storage.session.set({ pinnedTabs: next });
}

// ---------- archive ----------

const isBlank = (url) => !url || url.startsWith('chrome://newtab') || url === 'about:blank';

async function archiveTabs(tabs) {
  if (!tabs.length) return;
  const { spaces, archive } = await local();
  const records = [];
  for (const t of tabs) {
    if (isBlank(t.url)) continue;
    const s = await spaceForGroup(t.groupId, spaces);
    records.push({ id: uid(), url: t.url, title: t.title || t.url, spaceId: s ? s.id : null, archivedAt: Date.now() });
  }
  await chrome.storage.local.set({ archive: [...records, ...archive].slice(0, ARCHIVE_LIMIT) });
  await chrome.tabs.remove(tabs.map((t) => t.id)).catch(() => {});
}

async function runAutoArchive() {
  const { settings } = await local();
  const hrs = Number(settings.archiveAfterHours);
  if (!hrs) return;
  const cutoff = Date.now() - hrs * 3600 * 1000;
  const { pinnedTabs } = await session();
  const pinnedIds = new Set(Object.values(pinnedTabs));
  const tabs = await chrome.tabs.query({ windowType: 'normal' });
  const stale = tabs.filter(
    (t) => !t.active && !t.pinned && !t.audible && !pinnedIds.has(t.id) && t.lastAccessed && t.lastAccessed < cutoff
  );
  await archiveTabs(stale);
}

async function clearToday(windowId, spaceId) {
  const { spaces } = await local();
  const space = spaces.find((s) => s.id === spaceId);
  if (!space) return;
  const g = await findGroup(windowId, space);
  if (!g) return;
  const { pinnedTabs } = await session();
  const pinnedIds = new Set(Object.values(pinnedTabs));
  const tabs = (await chrome.tabs.query({ windowId, groupId: g.id })).filter((t) => !pinnedIds.has(t.id));
  if (!tabs.length) return;
  if (tabs.some((t) => t.active)) {
    const fresh = await chrome.tabs.create({ windowId, active: true });
    await addTabsToSpace([fresh.id], windowId, space);
  }
  await archiveTabs(tabs);
}

async function restoreArchived(windowId, id) {
  const { archive } = await local();
  const rec = archive.find((r) => r.id === id);
  if (!rec) return;
  await chrome.storage.local.set({ archive: archive.filter((r) => r.id !== id) });
  await chrome.tabs.create({ windowId, url: rec.url, active: true });
}

// ---------- spaces ----------

async function deleteSpace(spaceId) {
  const { spaces } = await local();
  const space = spaces.find((s) => s.id === spaceId);
  if (!space || spaces.length < 2) return;
  const remaining = spaces.filter((s) => s.id !== spaceId);
  const wins = await chrome.windows.getAll({ windowTypes: ['normal'] });
  const { activeSpace } = await session();

  for (const w of wins) {
    const g = await findGroup(w.id, space);
    if (activeSpace[w.id] === spaceId || !activeSpace[w.id]) {
      await setActiveSpace(w.id, remaining[0].id);
      await switchSpace(w.id, remaining[0].id);
    }
    if (g) {
      const tabs = await chrome.tabs.query({ windowId: w.id, groupId: g.id });
      await archiveTabs(tabs);
    }
  }
  const pinnedIds = [];
  walkLinks(space.items, (i) => pinnedIds.push(i.id));
  await patchSession('pinnedTabs', (m) => { pinnedIds.forEach((k) => delete m[k]); return m; });
  await patchSession('groupIds', (m) => {
    for (const k of Object.keys(m)) if (k.endsWith(`:${spaceId}`)) delete m[k];
    return m;
  });
  await chrome.storage.local.set({ spaces: remaining });
}

async function moveTabToSpace(tabId, spaceId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab || tab.pinned) return;
  const { spaces } = await local();
  const space = spaces.find((s) => s.id === spaceId);
  if (!space) return;
  await addTabsToSpace([tabId], tab.windowId, space);
  const current = await getActiveSpace(tab.windowId, spaces);
  if (tab.active) {
    await setActiveSpace(tab.windowId, spaceId);
    await collapseOthers(tab.windowId, spaceId, spaces);
  } else if (current && current.id !== spaceId) {
    const g = await findGroup(tab.windowId, space);
    if (g) await chrome.tabGroups.update(g.id, { collapsed: true }).catch(() => {});
  }
}

async function syncGroupTitles(oldSpaces, newSpaces) {
  const wins = await chrome.windows.getAll({ windowTypes: ['normal'] });
  for (const s of newSpaces) {
    const o = oldSpaces.find((x) => x.id === s.id);
    if (!o || (groupTitle(o) === groupTitle(s) && o.color === s.color)) continue;
    for (const w of wins) {
      const g = await findGroup(w.id, o);
      if (g) await chrome.tabGroups.update(g.id, { title: groupTitle(s), color: s.color }).catch(() => {});
    }
  }
}

// ---------- import from Arc ----------

async function importArc(windowId, { spaces: incoming, favorites = [], replace, openFavorites }) {
  if (!Array.isArray(incoming) || !incoming.length) return;
  const { spaces: current } = await local();
  const wins = await chrome.windows.getAll({ windowTypes: ['normal'] });

  if (replace) {
    // Pull open tabs out of the old spaces so they can land in the first imported space.
    const looseByWindow = {};
    for (const w of wins) {
      const ids = [];
      for (const s of current) {
        const g = await findGroup(w.id, s);
        if (g) ids.push(...(await chrome.tabs.query({ windowId: w.id, groupId: g.id })).map((t) => t.id));
      }
      if (ids.length) await chrome.tabs.ungroup(ids).catch(() => {});
      looseByWindow[w.id] = ids;
    }
    await chrome.storage.session.set({ pinnedTabs: {}, groupIds: {}, activeSpace: {} });
    await chrome.storage.local.set({ spaces: incoming });
    for (const w of wins) {
      if (looseByWindow[w.id].length) await addTabsToSpace(looseByWindow[w.id], w.id, incoming[0]);
      await setActiveSpace(w.id, incoming[0].id);
      await collapseOthers(w.id, incoming[0].id, incoming);
    }
  } else {
    // Merge: an empty Arch space with the same name takes the Arc contents, everything else is added.
    const merged = current.slice();
    for (const inc of incoming) {
      const same = merged.find((s) => s.name.trim().toLowerCase() === inc.name.trim().toLowerCase());
      if (same && !same.items.length) Object.assign(same, { items: inc.items, emoji: inc.emoji || same.emoji, color: inc.color });
      else merged.push(inc);
    }
    await chrome.storage.local.set({ spaces: merged });
  }

  if (openFavorites && favorites.length) {
    const pinned = await chrome.tabs.query({ windowId, pinned: true });
    for (const f of favorites) {
      if (pinned.some((t) => sameUrl(t.url || t.pendingUrl, f.url))) continue;
      await chrome.tabs.create({ windowId, url: f.url, pinned: true, active: false }).catch(() => {});
    }
  }
  await relinkPinned();
}

// ---------- auto picture-in-picture ----------

async function syncPipScript(injectExisting = false) {
  const { settings } = await local();
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: ['orbit-pip'] });
  if (settings.autoPip && !existing.length) {
    await chrome.scripting.registerContentScripts([{
      id: 'orbit-pip',
      js: ['pip.js'],
      matches: ['<all_urls>'],
      allFrames: true,
      runAt: 'document_start',
      world: 'MAIN',
      persistAcrossSessions: true,
    }]);
    injectExisting = true;
  } else if (!settings.autoPip && existing.length) {
    await chrome.scripting.unregisterContentScripts({ ids: ['orbit-pip'] });
    return;
  }
  if (settings.autoPip && injectExisting) {
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const t of tabs) {
      chrome.scripting
        .executeScript({ target: { tabId: t.id, allFrames: true }, files: ['pip.js'], world: 'MAIN' })
        .catch(() => {});
    }
  }
}

// ---------- setup ----------

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

function ensureAlarm() {
  chrome.alarms.get('orbit-archive', (a) => {
    if (!a) chrome.alarms.create('orbit-archive', { periodInMinutes: 15 });
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
});

chrome.runtime.onInstalled.addListener(() => serial(async () => {
  const s = await chrome.storage.local.get(['spaces', 'settings', 'archive']);
  // 0.1.x shipped Personal as Chrome blue and Work as purple with no Arc tint; move them to the pastels.
  if (s.spaces && s.spaces.some((x) => !x.tint)) {
    const defaults = { blue: '#8fa3dc', purple: '#a98bd6', pink: '#df92b8', red: '#dd8a8a', orange: '#e2a477',
      yellow: '#d6be6e', green: '#9cc283', cyan: '#7fb6d8', grey: '#a6a3ab' };
    for (const sp of s.spaces) {
      if (sp.tint) continue;
      if (sp.name === 'Personal' && sp.color === 'blue' && !sp.items.length) { sp.color = 'purple'; sp.tint = '#a98bd6'; }
      else if (sp.name === 'Work' && sp.color === 'purple' && !sp.items.length) { sp.color = 'blue'; sp.tint = '#8fa3dc'; }
      else sp.tint = defaults[sp.color] || '#a98bd6';
    }
    await chrome.storage.local.set({ spaces: s.spaces });
  }
  if (!s.spaces || !s.spaces.length) {
    await chrome.storage.local.set({
      spaces: defaultSpaces(),
      archive: s.archive || [],
      settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) },
    });
  }
  ensureAlarm();
  setupContextMenu();
  await syncPipScript(true);
  for (const t of await chrome.tabs.query({ audible: true })) await rememberMediaTab(t.id);
  // Pull existing loose tabs into the first space of each window.
  const { spaces } = await local();
  const wins = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
  for (const w of wins) {
    const space = await getActiveSpace(w.id, spaces);
    const loose = w.tabs.filter((t) => !t.pinned && t.groupId === -1).map((t) => t.id);
    if (loose.length) await addTabsToSpace(loose, w.id, space);
    await setActiveSpace(w.id, space.id);
  }
  await relinkPinned();
}));

chrome.runtime.onStartup.addListener(() => serial(async () => {
  ensureAlarm();
  await pullSync().catch(() => {});
  await relinkPinned();
  await runAutoArchive();
}));

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === 'orbit-archive') serial(runAutoArchive);
});

chrome.tabs.onCreated.addListener((t) => serial(() => adopt(t.id)));
// A favorite that gets un-favorited joins the active space, like Arc.
chrome.tabs.onUpdated.addListener((tabId, info) => { if (info.pinned === false) serial(() => adopt(tabId)); });

// Remember tabs that have played sound so the sidebar's Now Playing card can offer controls,
// even after the media is paused.
async function rememberMediaTab(tabId) {
  const { mediaTabs = [] } = await chrome.storage.session.get('mediaTabs');
  if (!mediaTabs.includes(tabId)) await chrome.storage.session.set({ mediaTabs: [tabId, ...mediaTabs].slice(0, 6) });
}
chrome.tabs.onUpdated.addListener((tabId, info) => { if (info.audible === true) rememberMediaTab(tabId); });
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { mediaTabs = [] } = await chrome.storage.session.get('mediaTabs');
  if (mediaTabs.includes(tabId)) await chrome.storage.session.set({ mediaTabs: mediaTabs.filter((id) => id !== tabId) });
});
chrome.runtime.onStartup.addListener(async () => {
  const audible = await chrome.tabs.query({ audible: true });
  for (const t of audible) await rememberMediaTab(t.id);
});
chrome.tabs.onAttached.addListener((tabId) => serial(() => adopt(tabId)));

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => serial(async () => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab || tab.groupId === -1) return;
  const { spaces } = await local();
  const s = await spaceForGroup(tab.groupId, spaces);
  if (!s) return;
  const { activeSpace } = await session();
  if (activeSpace[windowId] !== s.id) {
    await setActiveSpace(windowId, s.id);
    await collapseOthers(windowId, s.id, spaces);
  }
}));

chrome.tabs.onRemoved.addListener((tabId) => serial(() =>
  patchSession('pinnedTabs', (m) => {
    for (const k of Object.keys(m)) if (m[k] === tabId) delete m[k];
    return m;
  })
));

chrome.tabs.onReplaced.addListener((added, removed) => serial(() =>
  patchSession('pinnedTabs', (m) => {
    for (const k of Object.keys(m)) if (m[k] === removed) m[k] = added;
    return m;
  })
));

chrome.windows.onRemoved.addListener((windowId) => serial(async () => {
  await patchSession('activeSpace', (m) => { delete m[windowId]; return m; });
  await patchSession('groupIds', (m) => {
    for (const k of Object.keys(m)) if (k.startsWith(`${windowId}:`)) delete m[k];
    return m;
  });
}));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.spaces) serial(() => syncGroupTitles(changes.spaces.oldValue || [], changes.spaces.newValue || []));
  if (changes.settings) serial(() => syncPipScript());
});

// Open sidebars connect a port so a shortcut can toggle them (Arc's Cmd+S).
const panelPorts = new Map();
chrome.runtime.onConnect.addListener((port) => {
  if (!port.name.startsWith('orbit-panel:')) return;
  const windowId = Number(port.name.split(':')[1]);
  panelPorts.set(windowId, port);
  port.onMessage.addListener(() => {}); // heartbeat keeps the worker awake while a panel is open
  port.onDisconnect.addListener(() => { if (panelPorts.get(windowId) === port) panelPorts.delete(windowId); });
});

function toggleSidebar(tab) {
  const windowId = tab && tab.windowId;
  if (windowId == null) return;
  const port = panelPorts.get(windowId);
  if (port) port.postMessage({ type: 'close' });
  // Must be called synchronously from the shortcut so Chrome treats it as a user action.
  else chrome.sidePanel.open({ windowId }).catch((e) => console.warn('[orbit]', e));
}

// ---------- command bar ----------

let commandWinId = null;
async function openCommandBar(tab) {
  if (commandWinId != null) {
    const open = await chrome.windows.get(commandWinId).catch(() => null);
    commandWinId = null;
    if (open) { await chrome.windows.remove(open.id).catch(() => {}); return; } // shortcut again closes it
  }
  const base = tab ? await chrome.windows.get(tab.windowId) : await chrome.windows.getLastFocused({ windowTypes: ['normal'] });
  const width = Math.min(680, base.width - 40), height = 460;
  const opts = { url: chrome.runtime.getURL(`command.html?win=${base.id}`), type: 'popup', focused: true, width, height };
  const w = await chrome.windows.create({
    ...opts,
    left: Math.round(base.left + (base.width - width) / 2),
    top: Math.round(base.top + Math.max(60, Math.min(160, (base.height - height) / 3))),
  }).catch(() => chrome.windows.create(opts));
  commandWinId = w.id;
}
chrome.windows.onRemoved.addListener((id) => { if (id === commandWinId) commandWinId = null; });

// ---------- copy URL ----------

async function writeClipboard(text) {
  const has = chrome.offscreen.hasDocument ? await chrome.offscreen.hasDocument() : false;
  if (!has) {
    await chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['CLIPBOARD'], justification: 'Copy the current tab URL to the clipboard' })
      .catch((e) => { if (!/single offscreen/i.test(String(e))) throw e; });
  }
  return chrome.runtime.sendMessage({ target: 'offscreen', type: 'copy', text });
}

// Shows a short message in the sidebar if it is open, otherwise as a small toast on the page.
async function notify(tab, text) {
  const port = tab && panelPorts.get(tab.windowId);
  if (port) { port.postMessage({ type: 'toast', text }); return; }
  if (!tab) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [text],
    func: (msg) => {
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483647;padding:8px 14px;border-radius:10px;'
        + 'background:rgba(28,28,32,.92);color:#fff;font:600 13px -apple-system,BlinkMacSystemFont,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);'
        + 'transition:opacity .2s;pointer-events:none';
      document.documentElement.append(el);
      setTimeout(() => { el.style.opacity = '0'; }, 1200);
      setTimeout(() => el.remove(), 1500);
    },
  }).catch(() => {});
}

async function copyActiveUrl(tab) {
  if (!tab) [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || !tab.url) return;
  const ok = await writeClipboard(tab.url).catch(() => false);
  await notify(tab, ok ? 'Copied URL' : 'Couldn\u2019t copy URL');
}

chrome.commands.onCommand.addListener((cmd, tab) => {
  if (cmd === 'command-bar') openCommandBar(tab).catch((e) => console.warn('[arch]', e));
  if (cmd === 'copy-url') copyActiveUrl(tab).catch((e) => console.warn('[arch]', e));
});

chrome.commands.onCommand.addListener((cmd, tab) => {
  if (cmd === 'toggle-sidebar') toggleSidebar(tab);
  if (cmd === 'new-folder' && tab) {
    const port = panelPorts.get(tab.windowId);
    if (port) port.postMessage({ type: 'newFolder' });
    else {
      chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
      const t0 = Date.now();
      const iv = setInterval(() => {
        const p = panelPorts.get(tab.windowId);
        if (p) { clearInterval(iv); p.postMessage({ type: 'newFolder' }); } else if (Date.now() - t0 > 3000) clearInterval(iv);
      }, 100);
    }
  }
});

chrome.commands.onCommand.addListener((cmd, tab) => (cmd === 'next-space' || cmd === 'prev-space') && serial(async () => {
  const windowId = tab?.windowId ?? (await chrome.windows.getLastFocused()).id;
  const { spaces } = await local();
  if (!spaces.length) return;
  const cur = await getActiveSpace(windowId, spaces);
  const i = Math.max(0, spaces.indexOf(cur));
  const n = spaces.length;
  const next = cmd === 'next-space' ? spaces[(i + 1) % n] : spaces[(i - 1 + n) % n];
  await switchSpace(windowId, next.id);
}));

// ---------- full-page screenshot ----------
// Uses the DevTools protocol so the whole page is captured in one image (no scroll-and-stitch).
// Chrome shows a brief "started debugging this browser" bar while attached; that can't be hidden.
const MAX_SHOT_HEIGHT = 16000;

async function captureFullPage(windowId) {
  const [tab] = await chrome.tabs.query({ active: true, windowId });
  if (!tab || !/^https?:|^file:/.test(tab.url || '')) throw new Error('Chrome doesn’t allow screenshots of this page.');
  const target = { tabId: tab.id };
  if (!chrome.debugger) throw new Error('Allow screenshot permission first.');
  try {
    await chrome.debugger.attach(target, '1.3');
  } catch (e) {
    // DevTools already open on this tab, or similar: fall back to the visible area.
    const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
    return { dataUrl, title: tab.title, url: tab.url, partial: true };
  }
  try {
    // Pin the viewport to its current size first. Without this, Chrome repeats the first screen
    // on many sites instead of rendering the rest of the page.
    const { result } = await chrome.debugger.sendCommand(target, 'Runtime.evaluate', {
      expression: 'JSON.stringify([innerWidth, innerHeight, devicePixelRatio, scrollX, scrollY])', returnByValue: true,
    });
    const [vw, vh, dpr, sx, sy] = JSON.parse(result.value);
    await chrome.debugger.sendCommand(target, 'Emulation.setDeviceMetricsOverride', {
      width: vw, height: vh, deviceScaleFactor: dpr, mobile: false,
    });
    try {
      // Let Chrome redraw with the pinned viewport before capturing (two frames, then a short pause).
      await chrome.debugger.sendCommand(target, 'Runtime.evaluate', {
        expression: 'new Promise((r) => { requestAnimationFrame(() => requestAnimationFrame(r)); setTimeout(r, 500); })',
        awaitPromise: true,
      }).catch(() => {});
      await new Promise((r) => setTimeout(r, 250));
      const m = await chrome.debugger.sendCommand(target, 'Page.getLayoutMetrics');
      const size = m.cssContentSize || m.contentSize;
      const width = Math.ceil(size.width);
      const height = Math.min(Math.ceil(size.height), MAX_SHOT_HEIGHT);
      const shot = await chrome.debugger.sendCommand(target, 'Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height, scale: 1 },
      });
      return { dataUrl: `data:image/png;base64,${shot.data}`, title: tab.title, url: tab.url, truncated: size.height > MAX_SHOT_HEIGHT };
    } finally {
      await chrome.debugger.sendCommand(target, 'Emulation.clearDeviceMetricsOverride').catch(() => {});
      await chrome.debugger.sendCommand(target, 'Runtime.evaluate', { expression: `scrollTo(${sx}, ${sy})` }).catch(() => {});
    }
  } finally {
    await chrome.debugger.detach(target).catch(() => {});
  }
}

// ---------- peek ----------
// Peek windows are small popup windows centered over the window they came from.
// peeks maps peek window id -> parent window id (kept in session storage so it survives worker restarts).

async function peeks() { return (await chrome.storage.session.get('peeks')).peeks || {}; }
async function setPeeks(fn) { await chrome.storage.session.set({ peeks: fn({ ...(await peeks()) }) }); }

async function openPeek(url, fromWindowId) {
  const map = await peeks();
  // A peek from inside a peek just navigates that peek.
  if (map[fromWindowId] != null) {
    const [t] = await chrome.tabs.query({ windowId: fromWindowId });
    if (t) return chrome.tabs.update(t.id, { url });
  }
  const base = await chrome.windows.get(fromWindowId).catch(() => null) || await chrome.windows.getLastFocused({ windowTypes: ['normal'] });
  const width = Math.round(Math.min(1280, base.width * 0.74));
  const height = Math.round(base.height * 0.84);
  const opts = { url, type: 'popup', focused: true };
  let w;
  try {
    w = await chrome.windows.create({
      ...opts, width, height,
      left: Math.round(base.left + (base.width - width) / 2),
      top: Math.round(base.top + (base.height - height) / 2 + 12),
    });
  } catch (_) {
    // Chrome rejects bounds that fall mostly off-screen (e.g. a window straddling monitors); let it place the window.
    w = await chrome.windows.create({ ...opts, width: Math.min(width, 1000), height: Math.min(height, 760) })
      .catch(() => chrome.windows.create(opts));
  }
  await setPeeks((m) => ({ ...m, [w.id]: base.id }));
  return w;
}

async function promotePeek(peekWinId) {
  const map = await peeks();
  const parent = map[peekWinId];
  const [tab] = await chrome.tabs.query({ windowId: peekWinId });
  if (!tab || parent == null) return;
  await setPeeks((m) => { delete m[peekWinId]; return m; });
  const target = await chrome.windows.get(parent).catch(() => null) || await chrome.windows.getLastFocused({ windowTypes: ['normal'] });
  await chrome.tabs.move(tab.id, { windowId: target.id, index: -1 });
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(target.id, { focused: true });
  await adopt(tab.id); // joins the active space
}

async function closePeek(peekWinId) {
  await setPeeks((m) => { delete m[peekWinId]; return m; });
  await chrome.windows.remove(peekWinId).catch(() => {});
}

// Clicking back into the window a Peek came from closes it, like Arc.
chrome.windows.onFocusChanged.addListener(async (winId) => {
  if (winId === chrome.windows.WINDOW_ID_NONE) return;
  const map = await peeks();
  for (const [peekId, parentId] of Object.entries(map)) {
    if (Number(peekId) !== winId && parentId === winId) closePeek(Number(peekId));
  }
});
chrome.windows.onRemoved.addListener((id) => setPeeks((m) => { delete m[id]; return m; }));

// Messages that need to know which tab sent them.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const t = msg && msg.type;
  if (!['peek', 'peekInfo', 'peekPromote', 'peekClose'].includes(t)) return false;
  const winId = sender.tab && sender.tab.windowId;
  (async () => {
    if (t === 'peek') return openPeek(msg.url, winId ?? (await chrome.windows.getLastFocused({ windowTypes: ['normal'] })).id).then(() => null);
    if (t === 'peekInfo') return { isPeek: (await peeks())[winId] != null };
    if (t === 'peekPromote') return promotePeek(winId);
    if (t === 'peekClose') return closePeek(winId);
  })().then((r) => sendResponse({ ok: true, result: r ?? null }), (e) => sendResponse({ ok: false, error: String(e) }));
  return true;
});

// Right-click a link: Open link in Peek.
function setupContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'arch-peek', title: 'Open link in Peek', contexts: ['link'], targetUrlPatterns: ['http://*/*', 'https://*/*'] });
  });
}
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'arch-peek' && info.linkUrl) openPeek(info.linkUrl, tab ? tab.windowId : chrome.windows.WINDOW_ID_CURRENT);
});

// ---------- tidy ----------
// Closes duplicate tabs in a space's Today list and sorts the rest by site.

const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return url || ''; } };
const dupKey = (url) => (url || '').split('#')[0].replace(/\/$/, '');

async function tidyToday(windowId, spaceId) {
  const { spaces } = await local();
  const space = spaces.find((s) => s.id === spaceId);
  if (!space) return { closed: 0, sorted: 0 };
  const g = await findGroup(windowId, space);
  if (!g) return { closed: 0, sorted: 0 };
  const { pinnedTabs } = await session();
  const pinnedIds = new Set(Object.values(pinnedTabs));
  const all = (await chrome.tabs.query({ windowId, groupId: g.id })).sort((a, b) => a.index - b.index);
  const pinnedRows = all.filter((t) => pinnedIds.has(t.id));
  let today = all.filter((t) => !pinnedIds.has(t.id));

  // Duplicates: keep the one you're on, else the most recently used. Never close one playing audio.
  const keep = new Map();
  for (const t of today) {
    const k = dupKey(t.url || t.pendingUrl);
    if (!k || k.startsWith('chrome://newtab')) continue;
    const cur = keep.get(k);
    const better = !cur || t.active || (!cur.active && (t.lastAccessed || 0) > (cur.lastAccessed || 0));
    if (better) keep.set(k, t);
  }
  // Pinned tabs count as the original: a Today tab with the same URL as an open pin is a duplicate.
  const pinnedUrls = new Set(pinnedRows.map((t) => dupKey(t.url)));
  const close = today.filter((t) => {
    const k = dupKey(t.url || t.pendingUrl);
    if (!k || k.startsWith('chrome://newtab') || t.audible || t.active) return false;
    return pinnedUrls.has(k) || keep.get(k) !== t;
  });
  if (close.length) await chrome.tabs.remove(close.map((t) => t.id));
  const closedIds = new Set(close.map((t) => t.id));
  today = today.filter((t) => !closedIds.has(t.id));

  // Sort by site (sites in order of first appearance), newest first within a site.
  const order = [];
  for (const t of today) { const host = hostOf(t.url || t.pendingUrl); if (!order.includes(host)) order.push(host); }
  const sorted = [...today].sort((a, b) => (order.indexOf(hostOf(a.url)) - order.indexOf(hostOf(b.url))) || ((b.lastAccessed || 0) - (a.lastAccessed || 0)));
  const ids = [...pinnedRows, ...sorted].map((t) => t.id);
  if (ids.length) {
    const start = Math.min(...(await Promise.all(ids.map((id) => chrome.tabs.get(id)))).map((t) => t.index));
    await chrome.tabs.move(ids, { index: start });
    await chrome.tabs.group({ groupId: g.id, tabIds: ids }).catch(() => {});
  }
  return { closed: close.length, sorted: sorted.length };
}

// ---------- sync ----------
// Opt-in. Spaces (pins, folders, emoji, colors) and portable settings go to chrome.storage.sync,
// split into chunks to fit Chrome's per-item limit. Last writer wins.

const SYNC_CHUNK = 7000;            // chars per item (limit is 8 KB incl. key)
const SYNC_MAX = 95000;             // overall budget (limit is ~100 KB)
const SYNC_SETTINGS = ['archiveAfterHours', 'autoPip', 'peekTrigger', 'tintBackground'];
let syncTimer = null;

const hashOf = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

async function deviceId() {
  let { deviceId: id } = await chrome.storage.local.get('deviceId');
  if (!id) { id = Math.random().toString(36).slice(2, 10); await chrome.storage.local.set({ deviceId: id }); }
  return id;
}

async function syncEnabled() { return !!((await chrome.storage.local.get('settings')).settings || {}).syncEnabled; }

function syncPayload(spaces, settings) {
  const portable = {};
  for (const k of SYNC_SETTINGS) if (settings && k in settings) portable[k] = settings[k];
  return JSON.stringify({ spaces, settings: portable });
}

async function readRemote() {
  const { syncMeta } = await chrome.storage.sync.get('syncMeta');
  if (!syncMeta || !syncMeta.chunks) return null;
  const keys = Array.from({ length: syncMeta.chunks }, (_, i) => `syncChunk${i}`);
  const parts = await chrome.storage.sync.get(keys);
  const json = keys.map((k) => parts[k] || '').join('');
  if (hashOf(json) !== syncMeta.hash) return null; // a write is still arriving
  return { meta: syncMeta, data: JSON.parse(json) };
}

async function pushSync() {
  if (!(await syncEnabled())) return { ok: false };
  const { spaces, settings } = await local();
  const json = syncPayload(spaces, settings);
  if (json.length > SYNC_MAX) {
    await chrome.storage.local.set({ syncStatus: { error: 'too-big', size: json.length, at: Date.now() } });
    return { ok: false, error: 'too-big' };
  }
  const hash = hashOf(json);
  const { syncMeta } = await chrome.storage.sync.get('syncMeta');
  if (syncMeta && syncMeta.hash === hash) return { ok: true, unchanged: true };
  const chunks = [];
  for (let i = 0; i < json.length; i += SYNC_CHUNK) chunks.push(json.slice(i, i + SYNC_CHUNK));
  const items = {};
  chunks.forEach((c, i) => { items[`syncChunk${i}`] = c; });
  await chrome.storage.sync.set(items);
  const old = (syncMeta && syncMeta.chunks) || 0;
  if (old > chunks.length) await chrome.storage.sync.remove(Array.from({ length: old - chunks.length }, (_, i) => `syncChunk${chunks.length + i}`));
  const meta = { chunks: chunks.length, hash, updatedAt: Date.now(), device: await deviceId() };
  await chrome.storage.sync.set({ syncMeta: meta });
  await chrome.storage.local.set({ syncStatus: { ok: true, at: meta.updatedAt, size: json.length }, syncAppliedHash: hash });
  return { ok: true };
}

function schedulePush() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => serial(pushSync), 4000);
}

async function applyRemote(remote) {
  const { spaces: incoming, settings: portable } = remote.data;
  if (!Array.isArray(incoming) || !incoming.length) return false;
  const { settings } = await local();
  // Update spaces in place: open tabs stay in their groups (matched by space id), titles/colors follow.
  await chrome.storage.local.set({
    syncAppliedHash: remote.meta.hash,
    spaces: incoming,
    settings: { ...settings, ...(portable || {}), syncEnabled: true },
    syncStatus: { ok: true, at: remote.meta.updatedAt, pulled: true },
  });
  await relinkPinned();
  return true;
}

// Another computer pushed: take its version.
async function pullSync() {
  if (!(await syncEnabled())) return;
  const remote = await readRemote();
  if (!remote) return;
  const { syncAppliedHash } = await chrome.storage.local.get('syncAppliedHash');
  if (remote.meta.device === await deviceId() || remote.meta.hash === syncAppliedHash) return;
  await applyRemote(remote);
}

// Called when you turn sync on. If another computer already synced, the sidebar asks which copy to keep.
async function syncStatusForEnable() {
  const remote = await readRemote().catch(() => null);
  if (!remote || remote.meta.device === await deviceId()) return { remote: null };
  const count = (items) => (items || []).reduce((n, it) => n + (it.type === 'folder' ? count(it.children) : 1), 0);
  return {
    remote: {
      updatedAt: remote.meta.updatedAt,
      spaces: remote.data.spaces.map((s) => ({ name: s.name, emoji: s.emoji })),
      links: remote.data.spaces.reduce((n, s) => n + count(s.items), 0),
    },
  };
}

async function setSync(enabled, choice) {
  const { settings } = await local();
  await chrome.storage.local.set({ settings: { ...settings, syncEnabled: enabled } });
  if (!enabled) { await chrome.storage.local.set({ syncStatus: null }); return { ok: true }; }
  if (choice === 'remote') {
    const remote = await readRemote();
    if (remote) await applyRemote(remote);
    return { ok: true };
  }
  return pushSync();
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.syncMeta) serial(pullSync);
  if (area === 'local' && (changes.spaces || changes.settings)) {
    syncEnabled().then(async (on) => {
      if (!on) return;
      const { syncAppliedHash } = await chrome.storage.local.get('syncAppliedHash');
      const { spaces, settings } = await local();
      if (hashOf(syncPayload(spaces, settings)) !== syncAppliedHash) schedulePush();
    });
  }
});

// ---------- backup ----------

async function restoreBackup(windowId, data) {
  if (!data || !Array.isArray(data.spaces) || !data.spaces.length) throw new Error('That file doesn\u2019t contain any spaces.');
  await importArc(windowId, { spaces: data.spaces, favorites: data.favorites || [], replace: true, openFavorites: true });
  const cur = await chrome.storage.local.get(['settings', 'archive']);
  const patch = {};
  if (data.settings) patch.settings = { ...DEFAULT_SETTINGS, ...(cur.settings || {}), ...data.settings };
  if (Array.isArray(data.archive)) {
    const have = new Set((cur.archive || []).map((r) => r.url));
    patch.archive = [...(cur.archive || []), ...data.archive.filter((r) => r && r.url && !have.has(r.url))]
      .sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0)).slice(0, ARCHIVE_LIMIT);
  }
  if (Array.isArray(data.recentEmoji)) patch.recentEmoji = data.recentEmoji.slice(0, 24);
  await chrome.storage.local.set(patch);
}

// ---------- messages from the sidebar ----------

const handlers = {
  switchSpace: (m) => switchSpace(m.windowId, m.spaceId),
  openItem: (m) => openItem(m.windowId, m.itemId),
  mapPinned: (m) => patchSession('pinnedTabs', (x) => ({ ...x, [m.itemId]: m.tabId })),
  unmapPinned: (m) => patchSession('pinnedTabs', (x) => { (m.itemIds || []).forEach((k) => delete x[k]); return x; }),
  moveTabToSpace: (m) => moveTabToSpace(m.tabId, m.spaceId),
  clearToday: (m) => clearToday(m.windowId, m.spaceId),
  tidyToday: (m) => tidyToday(m.windowId, m.spaceId),
  syncCheck: () => syncStatusForEnable(),
  setSync: (m) => setSync(m.enabled, m.choice),
  syncNow: async () => { await pullSync(); return pushSync(); },
  restoreArchived: (m) => restoreArchived(m.windowId, m.id),
  deleteSpace: (m) => deleteSpace(m.spaceId),
  archiveNow: () => runAutoArchive(),
  importArc: (m) => importArc(m.windowId, m),
  screenshot: (m) => captureFullPage(m.windowId),
  restoreBackup: (m) => restoreBackup(m.windowId, m.data),
  openCommandBar: async (m) => openCommandBar(m.windowId != null ? { windowId: m.windowId } : null),
  newTab: async (m) => {
    const t = await chrome.tabs.create({ windowId: m.windowId, active: true, url: m.url });
    await adopt(t.id);
  },
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  const h = handlers[msg && msg.type];
  if (!h) return false;
  serial(() => h(msg)).then(
    (r) => sendResponse({ ok: true, result: r ?? null }),
    (e) => sendResponse({ ok: false, error: String(e) })
  );
  return true;
});

// ---------- site icons for pins Chrome hasn't seen yet ----------
// Chrome's favicon cache only knows pages you've visited, so freshly imported or added
// pins show a globe. For those, fetch the icon straight from the site (never a third
// party), shrink it, and keep it in storage.local under `icons`.
const iconKey = (u) => (u || '').split('#')[0];
const ICON_RETRY_MS = 3 * 24 * 3600 * 1000;
let defaultIconBytes = null;
let iconRun = null;
let iconTimer = null;

async function chromeFaviconBytes(pageUrl) {
  const u = new URL(chrome.runtime.getURL('/_favicon/'));
  u.searchParams.set('pageUrl', pageUrl);
  u.searchParams.set('size', '32');
  return new Uint8Array(await (await fetch(u)).arrayBuffer());
}
const sameBytes = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

async function chromeHasIcon(pageUrl) {
  try {
    if (!defaultIconBytes) defaultIconBytes = await chromeFaviconBytes('https://arch-no-icon.invalid/');
    return !sameBytes(await chromeFaviconBytes(pageUrl), defaultIconBytes);
  } catch (_) { return false; }
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[2] ?? m[3] ?? m[4] ?? '').trim() : '';
}

function iconCandidates(html, base) {
  const out = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = attr(tag, 'rel').toLowerCase();
    if (!/\bicon\b/.test(rel) || /mask-icon/.test(rel)) continue;
    const href = attr(tag, 'href');
    if (!href) continue;
    let url; try { url = new URL(href.replace(/&amp;/g, '&'), base).href; } catch (_) { continue; }
    const size = parseInt(attr(tag, 'sizes'), 10) || 0;
    const svg = /svg/i.test(attr(tag, 'type')) || /\.svg(\?|$)/i.test(url);
    // best first: 32-ish raster or svg, then bigger, then apple-touch, then tiny
    let score = svg ? 90 : size >= 32 && size <= 96 ? 100 : size > 96 ? 80 : size ? 60 : 70;
    if (/apple-touch/.test(rel)) score = 50;
    out.push({ url, score });
  }
  return out.sort((a, b) => b.score - a.score).map((c) => c.url);
}

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

async function iconToDataUrl(iconUrl) {
  const res = await fetch(iconUrl, { credentials: 'omit', signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const blob = await res.blob();
  if (!blob.size || blob.size > 1024 * 1024) return null;
  const type = (blob.type || res.headers.get('content-type') || '').toLowerCase();
  if (type.includes('svg') || /\.svg(\?|$)/i.test(iconUrl)) {
    if (blob.size > 40 * 1024) return null;
    return 'data:image/svg+xml;base64,' + toBase64(new Uint8Array(await blob.arrayBuffer()));
  }
  if (type.includes('html') || type.includes('json')) return null;
  const bmp = await createImageBitmap(blob);
  const S = 64; // 2x for retina at the 16-20px the sidebar shows
  const c = new OffscreenCanvas(S, S);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  const r = Math.min(S / bmp.width, S / bmp.height);
  const w = bmp.width * r, h = bmp.height * r;
  ctx.drawImage(bmp, (S - w) / 2, (S - h) / 2, w, h);
  bmp.close();
  const png = await c.convertToBlob({ type: 'image/png' });
  return 'data:image/png;base64,' + toBase64(new Uint8Array(await png.arrayBuffer()));
}

async function resolveSiteIcon(pageUrl) {
  let base = pageUrl, candidates = [];
  try {
    const res = await fetch(pageUrl, { credentials: 'omit', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    base = res.url || pageUrl;
    if ((res.headers.get('content-type') || '').includes('html')) candidates = iconCandidates((await res.text()).slice(0, 400000), base);
  } catch (_) { /* fall through to /favicon.ico */ }
  for (const origin of new Set([new URL(base).origin, new URL(pageUrl).origin])) candidates.push(origin + '/favicon.ico');
  for (const c of [...new Set(candidates)].slice(0, 5)) {
    try { const d = await iconToDataUrl(c); if (d) return d; } catch (_) { /* try the next one */ }
  }
  return null;
}

async function fillMissingIcons() {
  if (iconRun) return iconRun;
  iconRun = (async () => {
    const { spaces = [], icons = {}, iconMiss = {} } = await chrome.storage.local.get(['spaces', 'icons', 'iconMiss']);
    const urls = new Set();
    for (const s of spaces) walkLinks(s.items, (it) => { if (/^https?:/.test(it.url || '')) urls.add(iconKey(it.url)); });
    // forget icons for pins that no longer exist
    const keep = {}; for (const k of Object.keys(icons)) if (urls.has(k)) keep[k] = icons[k];
    const todo = [...urls].filter((u) => !keep[u] && !(iconMiss[u] && Date.now() - iconMiss[u] < ICON_RETRY_MS));
    const found = {}, missed = {};
    let pending = 0;
    const flush = async () => {
      if (!pending) return;
      pending = 0;
      const cur = await chrome.storage.local.get(['icons', 'iconMiss']);
      await chrome.storage.local.set({ icons: { ...keep, ...(cur.icons || {}), ...found }, iconMiss: { ...(cur.iconMiss || {}), ...missed } });
    };
    const queue = todo.slice();
    const worker = async () => {
      while (queue.length) {
        const u = queue.shift();
        if (await chromeHasIcon(u)) continue;
        const d = await resolveSiteIcon(u).catch(() => null);
        if (d) found[u] = d; else missed[u] = Date.now();
        if (++pending >= 6) await flush();
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    if (Object.keys(keep).length !== Object.keys(icons).length) pending++;
    await flush();
  })().finally(() => { iconRun = null; });
  return iconRun;
}

function scheduleIconFill(delay = 2500) {
  clearTimeout(iconTimer);
  iconTimer = setTimeout(() => fillMissingIcons().catch(() => {}), delay);
}
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.spaces) scheduleIconFill();
});
chrome.runtime.onStartup.addListener(() => scheduleIconFill(8000));
chrome.runtime.onInstalled.addListener(() => scheduleIconFill(4000));
