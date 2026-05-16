/**
 * Secure IPC channel validation.
 * Validates sender frame and prevents unauthorized IPC messages.
 */

import { BrowserWindow, WebFrameMain } from 'electron';

const ALLOWED_CHANNELS = new Set([
	'dialog:openFile',
	'dialog:saveFile',
	'dialog:confirm',
	'shell:openExternal',
	'app:getVersion',
	'app:getPath',
	'window:minimize',
	'window:close',
	'flash:start',
	'flash:cancel',
	'flash:progress',
	'drives:list',
	'drives:refresh',
	'settings:get',
	'settings:set',
	'queue:add',
	'queue:remove',
	'queue:clear',
]);

/**
 * Validate that an IPC message comes from an allowed sender.
 */
export function validateIPCSender(frame: WebFrameMain | null, mainWindow: BrowserWindow): boolean {
	if (!frame) return false;

	// Must come from main window's webContents
	const windowFrame = mainWindow.webContents.mainFrame;
	if (frame !== windowFrame) return false;

	// Must be from the same origin (file:// for local, or our dev server)
	const url = frame.url;
	if (!url.startsWith('file://') && !url.startsWith('http://localhost:')) {
		return false;
	}

	return true;
}

/**
 * Check if a channel name is in the allowlist.
 */
export function isAllowedChannel(channel: string): boolean {
	return ALLOWED_CHANNELS.has(channel);
}

/**
 * Sanitize data passed through IPC to prevent prototype pollution.
 */
export function sanitizeIPCData(data: unknown): unknown {
	if (data === null || data === undefined) return data;
	if (typeof data !== 'object') return data;

	// Deep clone to strip prototype chains
	return JSON.parse(JSON.stringify(data));
}

/**
 * Validate URL before opening externally.
 * Prevents file:// and javascript: URLs.
 */
export function isExternalUrlSafe(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}
