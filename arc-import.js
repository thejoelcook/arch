// Parses Arc's StorableSidebar.json into Arch spaces.
// Arc stores lists as flat arrays that alternate [id, object, id, object, ...],
// and builds the tree through childrenIds / parentID references.
(function (root) {
  const CHROME_COLORS = {
    grey: [95, 99, 104], blue: [26, 115, 232], red: [217, 48, 37], yellow: [249, 171, 0],
    green: [24, 128, 56], pink: [208, 24, 132], purple: [161, 66, 244], cyan: [0, 123, 131], orange: [250, 144, 62],
  };
  const FALLBACK = ['blue', 'purple', 'green', 'orange', 'pink', 'cyan', 'red', 'yellow', 'grey'];

  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const objectsOf = (arr) => (Array.isArray(arr) ? arr.filter((x) => x && typeof x === 'object') : []);

  // Arc stores pairs like ["pinned", "<id>", "unpinned", "<id>"].
  function pairValue(arr, key) {
    if (!Array.isArray(arr)) return null;
    for (let i = 0; i < arr.length - 1; i++) {
      const k = arr[i];
      if (k === key || (k && typeof k === 'object' && key in k)) return arr[i + 1];
    }
    return null;
  }

  function findContainer(json) {
    const candidates = [];
    const walk = (node, depth) => {
      if (!node || typeof node !== 'object' || depth > 6) return;
      if (Array.isArray(node.spaces) && Array.isArray(node.items)) candidates.push(node);
      for (const v of Object.values(node)) walk(v, depth + 1);
    };
    walk(json, 0);
    candidates.sort((a, b) => b.items.length - a.items.length);
    return candidates[0] || null;
  }

  function findRgb(node, depth = 0) {
    if (!node || typeof node !== 'object' || depth > 12) return null;
    if (typeof node.red === 'number' && typeof node.green === 'number' && typeof node.blue === 'number') {
      const scale = Math.max(node.red, node.green, node.blue) <= 1 ? 255 : 1;
      return [node.red * scale, node.green * scale, node.blue * scale];
    }
    for (const v of Object.values(node)) {
      const r = findRgb(v, depth + 1);
      if (r) return r;
    }
    return null;
  }

  function hue([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (d < 0.08) return { h: 0, s: 0 };
    let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: (h * 60 + 360) % 360, s: d / (1 - Math.abs(max + min - 1) || 1) };
  }

  function nearestColor(rgb) {
    const a = hue(rgb);
    if (a.s < 0.15) return 'grey';
    let best = 'blue', dist = Infinity;
    for (const [name, c] of Object.entries(CHROME_COLORS)) {
      if (name === 'grey') continue;
      const d = Math.abs(((hue(c).h - a.h + 540) % 360) - 180);
      if (d < dist) { dist = d; best = name; }
    }
    return best;
  }

  function emojiFor(space) {
    const icon = space.customInfo && space.customInfo.iconType;
    if (!icon) return '';
    if (typeof icon.emoji_v2 === 'string') return icon.emoji_v2;
    if (typeof icon.emoji === 'string') return icon.emoji;
    if (typeof icon.emoji === 'number') {
      try { return String.fromCodePoint(icon.emoji); } catch (_) { return ''; }
    }
    return '';
  }

  function parse(json) {
    const container = findContainer(json);
    if (!container) throw new Error("This doesn't look like Arc's StorableSidebar.json.");

    const items = new Map(objectsOf(container.items).map((it) => [it.id, it]));
    const kidsOf = (item) => {
      const ids = item.childrenIds || item.childrenIDs || [];
      if (ids.length) return ids.map((id) => items.get(id)).filter(Boolean);
      return [...items.values()].filter((x) => x.parentID === item.id);
    };

    const stats = { spaces: 0, links: 0, folders: 0, favorites: 0 };

    const convert = (item) => {
      const data = item.data || {};
      if (data.tab) {
        const url = data.tab.savedURL || data.tab.url;
        if (!url || /^arc:/.test(url)) return [];
        stats.links++;
        return [{ id: uid(), type: 'link', title: item.title || data.tab.savedTitle || url, url }];
      }
      const kids = kidsOf(item).flatMap(convert);
      // Split views and other wrappers have no title of their own: flatten them.
      if (data.splitView || data.easel || (!data.list && !item.title)) return kids;
      stats.folders++;
      return [{ id: uid(), type: 'folder', title: item.title || 'Folder', open: !item.isCollapsed, children: kids }];
    };

    const spaces = objectsOf(container.spaces).map((sp, i) => {
      const pinnedId = pairValue(sp.containerIDs || sp.newContainerIDs, 'pinned');
      const pinnedRoot = pinnedId != null ? items.get(pinnedId) : null;
      const rgb = findRgb(sp.customInfo && sp.customInfo.windowTheme);
      stats.spaces++;
      return {
        id: uid(),
        name: sp.title || `Space ${i + 1}`,
        emoji: emojiFor(sp),
        color: rgb ? nearestColor(rgb) : FALLBACK[i % FALLBACK.length],
        tint: rgb ? '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('') : null,
        items: pinnedRoot ? kidsOf(pinnedRoot).flatMap(convert) : [],
      };
    });

    // Favorites (Arc's top bar): collect links from every top-apps container.
    const favorites = [];
    const topIds = (container.topAppsContainerIDs || []).filter((x) => typeof x === 'string');
    const seen = new Set();
    for (const id of topIds) {
      const node = items.get(id);
      if (!node) continue;
      const walk = (n) => {
        const t = n.data && n.data.tab;
        if (t && (t.savedURL || t.url) && !seen.has(t.savedURL || t.url)) {
          seen.add(t.savedURL || t.url);
          favorites.push({ title: n.title || t.savedTitle, url: t.savedURL || t.url });
        }
        kidsOf(n).forEach(walk);
      };
      walk(node);
    }
    stats.favorites = favorites.length;

    if (!spaces.length) throw new Error('No spaces were found in that file.');
    return { spaces, favorites, stats };
  }

  root.parseArcSidebar = parse;
  if (typeof module !== 'undefined') module.exports = { parse };
})(typeof window !== 'undefined' ? window : globalThis);
