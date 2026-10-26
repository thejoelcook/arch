// Hidden page Chrome lets the extension use for clipboard writes from a keyboard shortcut.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.target !== 'offscreen' || msg.type !== 'copy') return false;
  const t = document.getElementById('t');
  t.value = msg.text;
  t.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
  sendResponse(ok);
  return false;
});
