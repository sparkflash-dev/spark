/**
 * Keyboard shortcut definitions and handler registration.
 * Centralizes all application keyboard shortcuts.
 */

export interface Shortcut {
	key: string;
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
	meta?: boolean;
	action: string;
	description: string;
}

export const SHORTCUTS: Shortcut[] = [
	{ key: 'o', ctrl: true, action: 'open-file', description: 'Open image file' },
	{ key: ',', ctrl: true, action: 'open-settings', description: 'Open settings' },
	{ key: 'Escape', action: 'close-dialog', description: 'Close dialog' },
	{ key: 'Enter', ctrl: true, action: 'start-flash', description: 'Start flash' },
	{ key: 'q', ctrl: true, action: 'quit', description: 'Quit application' },
	{ key: 'r', ctrl: true, action: 'refresh-drives', description: 'Refresh drive list' },
	{ key: 'h', ctrl: true, action: 'toggle-hidden', description: 'Toggle hidden drives' },
];

/**
 * Check if a keyboard event matches a shortcut.
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
	if (event.key.toLowerCase() !== shortcut.key.toLowerCase() && event.key !== shortcut.key) {
		return false;
	}
	if (shortcut.ctrl && !event.ctrlKey && !event.metaKey) return false;
	if (shortcut.alt && !event.altKey) return false;
	if (shortcut.shift && !event.shiftKey) return false;
	if (shortcut.meta && !event.metaKey) return false;
	return true;
}

/**
 * Get display string for a shortcut.
 */
export function formatShortcut(shortcut: Shortcut): string {
	const parts: string[] = [];
	if (shortcut.ctrl) parts.push('Ctrl');
	if (shortcut.alt) parts.push('Alt');
	if (shortcut.shift) parts.push('Shift');
	if (shortcut.meta) parts.push('⌘');

	const keyDisplay = shortcut.key === 'Escape' ? 'Esc'
		: shortcut.key === ',' ? ','
		: shortcut.key.toUpperCase();
	parts.push(keyDisplay);
	return parts.join('+');
}

/**
 * Find a shortcut by action name.
 */
export function getShortcutForAction(action: string): Shortcut | undefined {
	return SHORTCUTS.find((s) => s.action === action);
}
