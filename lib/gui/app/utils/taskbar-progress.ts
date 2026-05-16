/**
 * Taskbar/dock progress indicator.
 * Shows flash progress in the OS taskbar (Windows) or dock (macOS).
 */

import { BrowserWindow } from 'electron';
import * as os from 'os';

export type ProgressMode = 'normal' | 'error' | 'paused' | 'indeterminate' | 'none';

/**
 * Set taskbar/dock progress.
 * @param window - The main BrowserWindow
 * @param progress - Value between 0 and 1, or -1 to remove
 * @param mode - Progress mode (normal, error, paused)
 */
export function setTaskbarProgress(
	window: BrowserWindow,
	progress: number,
	mode: ProgressMode = 'normal',
): void {
	const platform = os.platform();

	if (platform === 'win32') {
		// Windows: supports progress bar in taskbar
		window.setProgressBar(progress, { mode: mode === 'none' ? 'none' : mode });
	} else if (platform === 'darwin') {
		// macOS: dock badge + progress
		if (progress >= 0 && progress <= 1) {
			window.setProgressBar(progress);
		} else {
			window.setProgressBar(-1); // Remove progress
		}
	} else if (platform === 'linux') {
		// Linux: Unity/KDE support via setProgressBar
		window.setProgressBar(progress);
	}
}

/**
 * Show indeterminate progress (bouncing animation).
 */
export function setIndeterminate(window: BrowserWindow): void {
	setTaskbarProgress(window, 2, 'indeterminate');
}

/**
 * Clear taskbar progress.
 */
export function clearTaskbarProgress(window: BrowserWindow): void {
	window.setProgressBar(-1);
}

/**
 * Set dock badge text (macOS only).
 */
export function setDockBadge(text: string): void {
	if (os.platform() === 'darwin') {
		const { app } = require('electron');
		app.dock?.setBadge(text);
	}
}

/**
 * Clear dock badge (macOS only).
 */
export function clearDockBadge(): void {
	setDockBadge('');
}
