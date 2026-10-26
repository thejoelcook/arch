// Welcome page: opens once on install, and from Settings > Tips & shortcuts.

const $ = (id) => document.getElementById(id);
const el = (tag, cls, ...kids) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  for (const k of kids) if (k != null) n.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return n;
};
const capsFor = (shortcut) => {
  const caps = archKeyCaps(shortcut);
  if (!caps.length) return el('span', 'unset', 'Not set');
  const wrap = el('span', 'keys');
  caps.forEach((c) => wrap.append(el('kbd', null, c)));
  return wrap;
};

// Intro video has no sound, so muted autoplay always works.
$('intro-video').play().catch(() => {});

let windowId = null;
chrome.windows.getCurrent().then((w) => { windowId = w.id; });

function markDone(id) { $(id).closest('.step').classList.add('done'); }

// The sidebar has to be opened straight from the click, so windowId is looked up ahead of time.
$('open-sidebar').addEventListener('click', () => {
  chrome.sidePanel.open({ windowId }).then(() => markDone('open-sidebar')).catch(() => {});
});
$('open-appearance').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://settings/appearance' });
  markDone('open-appearance');
});
$('import-arc').addEventListener('click', () => {
  chrome.sidePanel.open({ windowId }).catch(() => {});
  // Give the sidebar a moment to load, then ask it to show the import dialog.
  let tries = 0;
  const ask = () => chrome.runtime.sendMessage({ type: 'showArcImport' }).then((r) => {
    if (r && r.shown) markDone('import-arc');
    else if (++tries < 15) setTimeout(ask, 200);
  }).catch(() => { if (++tries < 15) setTimeout(ask, 200); });
  setTimeout(ask, 250);
});
$('change-keys').addEventListener('click', () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }));
$('set-toggle-key').addEventListener('click', () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }));

// Arc's sidebar shortcut. Extensions can't assign shortcuts themselves, so we check
// what Chrome gave us and walk the person through it when it isn't ⌘S / Ctrl+S.
const IS_MAC = /Mac/.test(navigator.platform || navigator.userAgent);
const WANT = IS_MAC ? ['⌘S', 'Command+S'] : ['Ctrl+S'];
if (!IS_MAC) document.querySelectorAll('.mod-key').forEach((k) => { k.textContent = 'Ctrl'; });
function drawToggleStep(shortcut, actionShortcut) {
  const ok = WANT.includes((shortcut || '').replace(/\s/g, ''));
  const step = $('step-keys');
  step.classList.toggle('done', ok);
  $('set-toggle-key').textContent = ok ? 'Change' : 'Set shortcut';
  $('set-toggle-key').classList.toggle('primary', !ok);
  $('keys-help').innerHTML = '';
  if (ok) $('keys-help').append('All set. Press it anywhere in Chrome to show or hide the sidebar.');
  else {
    const onAction = WANT.includes((actionShortcut || '').replace(/\s/g, ''));
    const cur = onAction
      ? [capsFor(actionShortcut), ' is on ', el('b', null, 'Activate the extension'), ' right now, which only opens the sidebar. Clear it there with the \u00d7 first. ']
      : shortcut ? ['Right now it\u2019s set to ', capsFor(shortcut), '. '] : ['It isn\u2019t set yet. '];
    $('keys-help').append(...cur, 'Chrome only lets you set this yourself: on the shortcuts page, find ', el('b', null, 'Arch'),
      ', click the pencil next to ', el('b', null, 'Toggle the Arch sidebar'), ' and press ', capsFor(IS_MAC ? '⌘S' : 'Ctrl+S'), '.');
  }
}

for (const f of ARCH_FEATURES) {
  $('features').append(el('div', 'feature', el('div', 'ic', f.icon), el('h3', null, f.title), el('p', null, f.short)));
}

async function drawShortcuts() {
  const cmds = await chrome.commands.getAll();
  const box = $('shortcuts');
  box.innerHTML = '';
  for (const [name, label] of Object.entries(ARCH_COMMAND_NAMES)) {
    const c = cmds.find((x) => x.name === name);
    box.append(el('div', 'sc', el('span', null, label), capsFor(c && c.shortcut)));
  }
  const toggle = cmds.find((x) => x.name === 'toggle-sidebar');
  const action = cmds.find((x) => x.name === '_execute_action');
  drawToggleStep(toggle && toggle.shortcut, action && action.shortcut);
  const t = $('toggle-keys');
  t.innerHTML = '';
  t.append(capsFor(toggle && toggle.shortcut));
}
drawShortcuts();
// Pick up changes made on chrome://extensions/shortcuts when you come back.
document.addEventListener('visibilitychange', () => { if (!document.hidden) drawShortcuts(); });
