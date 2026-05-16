/**
 * Application menu builder.
 * Constructs the native menu bar with platform-appropriate items.
 */

import { Menu, MenuItem, BrowserWindow, app, shell } from 'electron';
import * as os from 'os';

export interface MenuActions {
	openFile: () => void;
	openSettings: () => void;
	openUrl: (url: string) => void;
	checkUpdate: () => void;
}

/**
 * Build and set the application menu.
 */
export function buildAppMenu(window: BrowserWindow, actions: MenuActions): Menu {
	const isMac = os.platform() === 'darwin';
	const template: (Electron.MenuItemConstructorOptions | MenuItem)[] = [];

	// macOS app menu
	if (isMac) {
		template.push({
			label: app.getName(),
			submenu: [
				{ label: 'About Spark', role: 'about' },
				{ type: 'separator' },
				{ label: 'Check for Updates...', click: actions.checkUpdate },
				{ type: 'separator' },
				{ label: 'Hide Spark', role: 'hide' },
				{ label: 'Hide Others', role: 'hideOthers' },
				{ label: 'Show All', role: 'unhide' },
				{ type: 'separator' },
				{ label: 'Quit Spark', role: 'quit' },
			],
		});
	}

	// File menu
	template.push({
		label: 'File',
		submenu: [
			{
				label: 'Open Image...',
				accelerator: 'CmdOrCtrl+O',
				click: actions.openFile,
			},
			{ type: 'separator' },
			{
				label: 'Settings',
				accelerator: 'CmdOrCtrl+,',
				click: actions.openSettings,
			},
			{ type: 'separator' },
			isMac ? { role: 'close' } : { role: 'quit' },
		],
	});

	// Edit menu
	template.push({
		label: 'Edit',
		submenu: [
			{ role: 'copy' },
			{ role: 'paste' },
			{ role: 'selectAll' },
		],
	});

	// View menu
	template.push({
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forceReload' },
			{ role: 'toggleDevTools' },
			{ type: 'separator' },
			{ role: 'resetZoom' },
			{ role: 'zoomIn' },
			{ role: 'zoomOut' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' },
		],
	});

	// Help menu
	template.push({
		label: 'Help',
		submenu: [
			{
				label: 'Spark Website',
				click: () => actions.openUrl('https://github.com/sparkflash-dev/spark'),
			},
			{
				label: 'Report an Issue',
				click: () => actions.openUrl('https://github.com/sparkflash-dev/spark/issues'),
			},
			{ type: 'separator' },
			{
				label: 'Check for Updates...',
				click: actions.checkUpdate,
			},
		],
	});

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
	return menu;
}
