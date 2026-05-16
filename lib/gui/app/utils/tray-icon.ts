/**
 * System tray icon support.
 * Shows flash progress in the system tray/taskbar.
 */

import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import * as path from 'path';

let tray: Tray | null = null;

/**
 * Create system tray icon.
 */
export function createTray(mainWindow: BrowserWindow): Tray {
	const iconPath = path.join(__dirname, '..', '..', '..', 'assets', 'icon.png');
	const icon = nativeImage.createFromPath(iconPath);
	tray = new Tray(icon.resize({ width: 16, height: 16 }));

	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Show Spark', click: () => mainWindow.show() },
		{ type: 'separator' },
		{ label: 'Quit', click: () => app.quit() },
	]);

	tray.setToolTip('Spark — Image Flasher');
	tray.setContextMenu(contextMenu);

	tray.on('click', () => {
		if (mainWindow.isVisible()) {
			mainWindow.focus();
		} else {
			mainWindow.show();
		}
	});

	return tray;
}

/**
 * Update tray tooltip with flash progress.
 */
export function updateTrayProgress(percentage: number, phase: string): void {
	if (!tray) return;
	const phaseLabel = phase === 'verifying' ? 'Verifying' : 'Flashing';
	tray.setToolTip(`Spark — ${phaseLabel}: ${Math.round(percentage)}%`);
}

/**
 * Reset tray to idle state.
 */
export function resetTray(): void {
	if (!tray) return;
	tray.setToolTip('Spark — Image Flasher');
}

/**
 * Destroy the tray icon.
 */
export function destroyTray(): void {
	if (tray) {
		tray.destroy();
		tray = null;
	}
}
