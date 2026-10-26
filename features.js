// Shared feature list for the welcome page and the Tips & shortcuts page.
// `cmd` links a feature to its keyboard shortcut (read live from Chrome).
const ARCH_FEATURES = [
  { id: 'spaces', icon: '\u{1F3E0}', title: 'Spaces', cmd: ['next-space', 'prev-space'],
    short: 'Separate sets of tabs for work, personal and projects.',
    how: ['Click a space icon at the bottom of the sidebar to switch.', 'Two-finger swipe sideways in the sidebar to move between spaces.', 'Click + › New space to add one. Right-click a space to edit its name, emoji and color.'] },
  { id: 'pins', icon: '\u{1F4CC}', title: 'Pinned tabs & folders', cmd: ['new-folder'],
    short: 'Tabs that stay in a space, even after you close them.',
    how: ['Drag a tab above the divider to pin it, or right-click › Pin to this space.', 'Right-click › New folder with this tab, or drag pins onto a folder to nest them.', '⌘-click or ⇧-click to select several tabs, then right-click › Group into folder.', 'If a pinned tab wanders off, click the / to go back to its pinned page.'] },
  { id: 'favorites', icon: '⭐', title: 'Favorites', short: 'Icon tiles at the top that follow you across every space.',
    how: ['Right-click any tab › Add to Favorites.', 'Drag tiles to reorder them.', 'Right-click a tile › Remove from favorites.'] },
  { id: 'command', icon: '\u{1F50D}', title: 'Command bar', cmd: ['command-bar'],
    short: 'Search open tabs, pins, history and bookmarks, or run actions.',
    how: ['Press the shortcut, type, and hit Enter.', 'Type a web address to open it, or anything else to search.', 'Try actions like “mute”, “copy url” or “switch”.'] },
  { id: 'peek', icon: '\u{1F440}', title: 'Peek', short: 'Open a link in a floating window without leaving your page.',
    how: ['⇧-click any link (change to ⌥-click in Settings).', 'Or right-click a link › Open link in Peek.', 'Press Esc to close, or click Open as tab to keep it.'] },
  { id: 'archive', icon: '\u{1F5C3}', title: 'Auto-archive', short: 'Tabs you haven’t used in a while tidy themselves away.',
    how: ['Choose how long in Settings › Tabs (12 hours by default).', 'Find and reopen anything from Settings › Archived tabs or the command bar.', 'Pinned tabs, favorites and anything playing audio are never archived.'] },
  { id: 'tidy', icon: '✨', title: 'Tidy & Clear', short: 'One click to close duplicates or clear today’s tabs.',
    how: ['Hover the line above your tabs.', 'Tidy closes duplicates and sorts by site. Clear moves today’s tabs to the archive.'] },
  { id: 'nowplaying', icon: '\u{1F3B5}', title: 'Now Playing', short: 'Control music and video from other tabs.',
    how: ['Appears at the bottom of the sidebar when another tab plays media.', 'Play, pause, skip 10 seconds, seek, mute, or click the title to jump to the tab.', 'Click a speaker icon on any tab to mute it.'] },
  { id: 'pip', icon: '\u{1F4FA}', title: 'Auto picture-in-picture', short: 'Videos float when you switch tabs.',
    how: ['Play a video, then switch tabs.', 'Turn it off in Settings › Media.'] },
  { id: 'screenshot', icon: '\u{1F4F8}', title: 'Full-page screenshots', short: 'Capture an entire page, top to bottom.',
    how: ['Hover the address bar in the sidebar and click the screenshot icon.', 'Choose Copy or Download.'] },
  { id: 'copy', icon: '\u{1F517}', title: 'Copy URL', cmd: ['copy-url'], short: 'Grab the current address in one keystroke.',
    how: ['Hover the address bar and click the link icon, or set a shortcut such as ⇧⌘C.'] },
  { id: 'downloads', icon: '⬇️', title: 'Downloads tray', short: 'Recent downloads, ready to drag into any app.',
    how: ['Click the download icon next to the gear.', 'Drag a file out, click to open, or right-click for more.'] },
  { id: 'sync', icon: '\u{1F504}', title: 'Sync & backup', short: 'Keep your spaces on every computer.',
    how: ['Turn on Settings › Data › Sync across computers (uses your Chrome account).', 'Export a backup file any time, and restore it later.'] },
  { id: 'arc', icon: '\u{1F4E5}', title: 'Import from Arc', short: 'Bring over your spaces, pins, folders and favorites.',
    how: ['Settings › Data › Import from Arc.', 'Turn on “Allow access to file URLs” for Arch and it finds your Arc file automatically. Otherwise, choose StorableSidebar.json yourself.'] },
];

const ARCH_COMMAND_NAMES = {
  'toggle-sidebar': 'Show or hide the sidebar',
  'command-bar': 'Command bar',
  'next-space': 'Next space',
  'prev-space': 'Previous space',
  'new-folder': 'New folder',
  'copy-url': 'Copy URL',
};

// Turns Chrome's "⌘⇧Space" / "Ctrl+Shift+Space" into key caps.
function archKeyCaps(shortcut) {
  if (!shortcut) return [];
  if (shortcut.includes('+')) return shortcut.split('+').map((k) => k.replace('Arrow', '').trim());
  return [...shortcut.replace(/(Space|Left|Right|Up|Down|Arrow)/g, ' $1 ').split(/\s+/).filter(Boolean)
    .flatMap((part) => (/^(Space|Left|Right|Up|Down)$/.test(part) ? [part] : [...part]))];
}
