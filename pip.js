// Arch auto picture-in-picture.
// Runs in the page's MAIN world. Registers the Media Session "enterpictureinpicture"
// handler so Chrome (134+) pops the playing video out when you switch tabs,
// and closes the floating window again when you come back to the tab.
(() => {
  if (window.__orbitPip) return;
  window.__orbitPip = true;
  if (!('mediaSession' in navigator) || !document.pictureInPictureEnabled) return;

  let ours = false;

  const bestVideo = () => {
    const playing = [...document.querySelectorAll('video')].filter(
      (v) => !v.paused && !v.ended && v.readyState >= 2 && !v.disablePictureInPicture
    );
    playing.sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight);
    return playing[0] || null;
  };

  const enter = async () => {
    if (document.pictureInPictureElement) return;
    const v = bestVideo();
    if (!v) return;
    try {
      await v.requestPictureInPicture();
      ours = true;
    } catch (_) {
      /* site or browser refused, nothing to do */
    }
  };

  const register = () => {
    try {
      navigator.mediaSession.setActionHandler('enterpictureinpicture', enter);
    } catch (_) {
      /* older Chrome without this action */
    }
  };

  register();
  // Some players rebuild their media session on play; re-register so ours sticks.
  document.addEventListener('play', register, true);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ours && document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
      ours = false;
    }
  });
  document.addEventListener('leavepictureinpicture', () => { ours = false; }, true);
})();
