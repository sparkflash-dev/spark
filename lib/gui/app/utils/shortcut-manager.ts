/**
 * Global shortcut manager — register and handle keyboard shortcuts consistently.
 */

export interface Shortcut {
  id: string;
  keys: string; // e.g., 'Ctrl+O', 'Cmd+Shift+V'
  description: string;
  action: string;
  category: 'file' | 'edit' | 'view' | 'flash' | 'nav';
  enabled: boolean;
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: 'open-image', keys: 'CmdOrCtrl+O', description: 'Open image file', action: 'open-image', category: 'file', enabled: true },
  { id: 'select-drive', keys: 'CmdOrCtrl+D', description: 'Select drive', action: 'select-drive', category: 'file', enabled: true },
  { id: 'start-flash', keys: 'CmdOrCtrl+Enter', description: 'Start flash', action: 'start-flash', category: 'flash', enabled: true },
  { id: 'cancel-flash', keys: 'Escape', description: 'Cancel flash', action: 'cancel-flash', category: 'flash', enabled: true },
  { id: 'toggle-verify', keys: 'CmdOrCtrl+Shift+V', description: 'Toggle verification', action: 'toggle-verify', category: 'flash', enabled: true },
  { id: 'open-settings', keys: 'CmdOrCtrl+,', description: 'Open settings', action: 'open-settings', category: 'nav', enabled: true },
  { id: 'toggle-theme', keys: 'CmdOrCtrl+Shift+T', description: 'Toggle dark/light theme', action: 'toggle-theme', category: 'view', enabled: true },
  { id: 'zoom-in', keys: 'CmdOrCtrl+=', description: 'Zoom in', action: 'zoom-in', category: 'view', enabled: true },
  { id: 'zoom-out', keys: 'CmdOrCtrl+-', description: 'Zoom out', action: 'zoom-out', category: 'view', enabled: true },
  { id: 'zoom-reset', keys: 'CmdOrCtrl+0', description: 'Reset zoom', action: 'zoom-reset', category: 'view', enabled: true },
  { id: 'refresh-drives', keys: 'F5', description: 'Refresh drive list', action: 'refresh-drives', category: 'file', enabled: true },
  { id: 'quit', keys: 'CmdOrCtrl+Q', description: 'Quit Spark', action: 'quit', category: 'nav', enabled: true },
];

export function getShortcutsByCategory(category: Shortcut['category']): Shortcut[] {
  return DEFAULT_SHORTCUTS.filter((s) => s.category === category && s.enabled);
}

export function findShortcutByKeys(keys: string): Shortcut | undefined {
  return DEFAULT_SHORTCUTS.find((s) => s.keys === keys && s.enabled);
}

export function formatShortcutsHelp(): string {
  const categories = ['file', 'flash', 'view', 'nav'] as const;
  const lines: string[] = ['Keyboard Shortcuts:', ''];

  for (const cat of categories) {
    const shortcuts = getShortcutsByCategory(cat);
    if (shortcuts.length === 0) continue;
    lines.push(`  ${cat.charAt(0).toUpperCase() + cat.slice(1)}:`);
    for (const s of shortcuts) {
      const keys = s.keys.replace('CmdOrCtrl', process.platform === 'darwin' ? '⌘' : 'Ctrl');
      lines.push(`    ${keys.padEnd(20)} ${s.description}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
