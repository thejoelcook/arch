// Arch Peek: Shift-click (or Option-click) a link to open it in a small floating window.
// In a Peek window, shows a small toolbar to promote it to a real tab or close it.
(() => {
  if (window.__archPeek) return;
  window.__archPeek = true;

  let trigger = 'shift';
  const readSettings = () => chrome.storage.local.get('settings').then(({ settings }) => {
    trigger = (settings && settings.peekTrigger) || 'shift';
  }).catch(() => {});
  readSettings();
  chrome.storage.onChanged.addListener((c, area) => { if (area === 'local' && c.settings) readSettings(); });

  const wants = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey
    && ((trigger === 'shift' && e.shiftKey && !e.altKey) || (trigger === 'alt' && e.altKey && !e.shiftKey));

  const linkFrom = (e) => {
    for (const el of e.composedPath()) {
      if (el && el.tagName === 'A' && el.href) return el;
      if (el === document) break;
    }
    return null;
  };

  const onClick = (e) => {
    if (trigger === 'off' || !wants(e)) return;
    const a = linkFrom(e);
    if (!a || !/^https?:/i.test(a.href) || a.hasAttribute('download')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    chrome.runtime.sendMessage({ type: 'peek', url: a.href }).catch(() => {});
  };
  // Capture on window so sites' own click handlers don't swallow it first.
  window.addEventListener('click', onClick, true);
  window.addEventListener('auxclick', (e) => { if (trigger !== 'off' && wants(e) && linkFrom(e)) e.preventDefault(); }, true);

  if (window !== window.top) return;

  // ---------- toolbar inside a Peek window ----------
  chrome.runtime.sendMessage({ type: 'peekInfo' }).then((res) => {
    if (!res || !res.ok || !res.result || !res.result.isPeek) return;
    const mount = () => {
      const host = document.createElement('arch-peek-bar');
      host.style.cssText = 'all:initial;position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483647';
      const root = host.attachShadow({ mode: 'closed' });
      root.innerHTML = `
        <style>
          .bar { display:flex; gap:4px; padding:4px; border-radius:11px; background:rgba(250,249,253,.92); backdrop-filter:blur(16px);
                 box-shadow:0 0 0 .5px rgba(0,0,0,.14),0 6px 20px rgba(0,0,0,.18); font:600 12.5px -apple-system,BlinkMacSystemFont,system-ui,sans-serif;
                 opacity:.55; transition:opacity .15s }
          .bar:hover { opacity:1 }
          button { all:unset; display:flex; align-items:center; gap:6px; height:26px; padding:0 10px; border-radius:8px; color:#1f1f24; cursor:pointer }
          button:hover { background:rgba(0,0,0,.07) }
          svg { width:14px; height:14px }
          @media (prefers-color-scheme: dark) {
            .bar { background:rgba(40,39,46,.92); box-shadow:0 0 0 .5px rgba(255,255,255,.12),0 6px 20px rgba(0,0,0,.4) }
            button { color:#ececf1 } button:hover { background:rgba(255,255,255,.1) }
          }
        </style>
        <div class="bar">
          <button class="open" title="Open as a tab in your current space">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5h4v4M13.5 2.5L8 8M12 9.5V13a.5.5 0 01-.5.5h-8A.5.5 0 013 13V4.5a.5.5 0 01.5-.5H7"/></svg>
            Open as tab
          </button>
          <button class="close" title="Close (Esc)">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>
          </button>
        </div>`;
      root.querySelector('.open').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'peekPromote' }));
      root.querySelector('.close').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'peekClose' }));
      document.documentElement.append(host);
    };
    if (document.documentElement) mount(); else document.addEventListener('DOMContentLoaded', mount);
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      chrome.runtime.sendMessage({ type: 'peekClose' });
    });
  }).catch(() => {});
})();
