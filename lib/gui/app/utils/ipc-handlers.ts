/**
 * IPC handler registration for main process.
 * Centralizes all ipcMain handlers for renderer ↔ main communication.
 */

import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import * as path from 'path';

/**
 * Register all IPC handlers for the main process.
 */
export function registerIPCHandlers(mainWindow: BrowserWindow): void {
	// Open file dialog
	ipcMain.handle('dialog:openFile', async (_event, options) => {
		const result = await dialog.showOpenDialog(mainWindow, {
			properties: ['openFile'],
			filters: [
				{
					name: 'Disk Images',
					extensions: ['img', 'iso', 'bin', 'raw', 'dmg', 'dsk', 'gz', 'bz2', 'xz', 'zip', 'zst'],
				},
				{ name: 'All Files', extensions: ['*'] },
			],
			...options,
		});
		return result.canceled ? null : result.filePaths[0];
	});

	// Open save dialog (for config export)
	ipcMain.handle('dialog:saveFile', async (_event, options) => {
		const result = await dialog.showSaveDialog(mainWindow, {
			filters: [{ name: 'JSON', extensions: ['json'] }],
			...options,
		});
		return result.canceled ? null : result.filePath;
	});

	// Open external URL
	ipcMain.handle('shell:openExternal', async (_event, url: string) => {
		// Only allow http/https URLs
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			throw new Error('Only HTTP/HTTPS URLs are allowed');
		}
		await shell.openExternal(url);
	});

	// Get app version
	ipcMain.handle('app:getVersion', () => {
		return require('../../../../package.json').version;
	});

	// Get app paths
	ipcMain.handle('app:getPath', (_event, name: string) => {
		const { app } = require('electron');
		return app.getPath(name);
	});

	// Minimize window
	ipcMain.on('window:minimize', () => {
		mainWindow.minimize();
	});

	// Close window
	ipcMain.on('window:close', () => {
		mainWindow.close();
	});

	// Show confirmation dialog
	ipcMain.handle('dialog:confirm', async (_event, options) => {
		const result = await dialog.showMessageBox(mainWindow, {
			type: 'warning',
			buttons: ['Cancel', 'Confirm'],
			defaultId: 0,
			cancelId: 0,
			...options,
		});
		return result.response === 1;
	});
}

/**
 * Remove all registered IPC handlers.
 */
export function removeIPCHandlers(): void {
	const channels = [
		'dialog:openFile',
		'dialog:saveFile',
		'shell:openExternal',
		'app:getVersion',
		'app:getPath',
		'dialog:confirm',
	];
	channels.forEach((ch) => ipcMain.removeHandler(ch));
	ipcMain.removeAllListeners('window:minimize');
	ipcMain.removeAllListeners('window:close');
}
