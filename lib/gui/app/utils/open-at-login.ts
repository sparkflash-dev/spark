/**
 * Open-at-login management.
 * Controls whether Spark starts automatically when the user logs in.
 */

import { app } from 'electron';

/**
 * Check if Spark is set to open at login.
 */
export function isOpenAtLoginEnabled(): boolean {
	try {
		const settings = app.getLoginItemSettings();
		return settings.openAtLogin;
	} catch {
		return false;
	}
}

/**
 * Enable opening Spark at login.
 */
export function enableOpenAtLogin(): void {
	try {
		app.setLoginItemSettings({
			openAtLogin: true,
			openAsHidden: true, // Start minimized to tray
		});
	} catch (err) {
		console.warn('Failed to set login item:', err);
	}
}

/**
 * Disable opening Spark at login.
 */
export function disableOpenAtLogin(): void {
	try {
		app.setLoginItemSettings({
			openAtLogin: false,
		});
	} catch (err) {
		console.warn('Failed to remove login item:', err);
	}
}

/**
 * Toggle open-at-login setting.
 */
export function toggleOpenAtLogin(): boolean {
	const current = isOpenAtLoginEnabled();
	if (current) {
		disableOpenAtLogin();
	} else {
		enableOpenAtLogin();
	}
	return !current;
}
