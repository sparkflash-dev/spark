/**
 * Single instance lock for Spark.
 * Ensures only one instance of the app runs at a time.
 * When a second instance is launched, focus the existing window instead.
 */

import { app, BrowserWindow } from 'electron';

/**
 * Request single instance lock.
 * Returns true if this is the first instance.
 */
export function requestSingleInstanceLock(
	onSecondInstance?: (argv: string[]) => void,
): boolean {
	const gotLock = app.requestSingleInstanceLock();

	if (!gotLock) {
		// Another instance is already running
		app.quit();
		return false;
	}

	// Handle second instance attempts
	app.on('second-instance', (_event, argv) => {
		// Focus the existing window
		const windows = BrowserWindow.getAllWindows();
		if (windows.length > 0) {
			const mainWindow = windows[0];
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}
			mainWindow.focus();
		}

		// Forward command line args to callback
		if (onSecondInstance) {
			onSecondInstance(argv);
		}
	});

	return true;
}

/**
 * Extract file path from command line arguments.
 * Used when an image file is opened via "Open With" or CLI.
 */
export function extractFileFromArgs(argv: string[]): string | null {
	// Skip the first arg (executable path) and any flags
	for (let i = 1; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg.startsWith('-') && !arg.startsWith('--')) {
			// Check if it looks like a file path
			const lower = arg.toLowerCase();
			if (lower.match(/\.(iso|img|bin|raw|dmg|dsk|gz|xz|bz2|zip|zst)$/)) {
				return arg;
			}
		}
	}
	return null;
}
