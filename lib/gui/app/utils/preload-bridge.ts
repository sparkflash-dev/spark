/**
 * Preload bridge for secure renderer ↔ main communication.
 * Exposes only approved APIs via contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';

/**
 * API exposed to the renderer via contextBridge.
 */
const sparkAPI = {
	// File operations
	openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
	saveFileDialog: (options?: any) => ipcRenderer.invoke('dialog:saveFile', options),

	// Shell
	openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),

	// App info
	getVersion: () => ipcRenderer.invoke('app:getVersion'),
	getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),

	// Window controls
	minimize: () => ipcRenderer.send('window:minimize'),
	close: () => ipcRenderer.send('window:close'),

	// Flash operations
	startFlash: (options: any) => ipcRenderer.invoke('flash:start', options),
	cancelFlash: () => ipcRenderer.invoke('flash:cancel'),
	onFlashProgress: (callback: (progress: any) => void) => {
		const handler = (_event: any, data: any) => callback(data);
		ipcRenderer.on('flash:progress', handler);
		return () => ipcRenderer.removeListener('flash:progress', handler);
	},

	// Drive operations
	listDrives: () => ipcRenderer.invoke('drives:list'),
	refreshDrives: () => ipcRenderer.invoke('drives:refresh'),
	onDrivesChanged: (callback: (drives: any[]) => void) => {
		const handler = (_event: any, data: any) => callback(data);
		ipcRenderer.on('drives:changed', handler);
		return () => ipcRenderer.removeListener('drives:changed', handler);
	},

	// Settings
	getSettings: () => ipcRenderer.invoke('settings:get'),
	setSetting: (key: string, value: any) => ipcRenderer.invoke('settings:set', { key, value }),

	// Queue
	addToQueue: (item: any) => ipcRenderer.invoke('queue:add', item),
	removeFromQueue: (id: string) => ipcRenderer.invoke('queue:remove', id),
	clearQueue: () => ipcRenderer.invoke('queue:clear'),

	// Confirmation dialog
	confirm: (options: any) => ipcRenderer.invoke('dialog:confirm', options),
};

export type SparkAPI = typeof sparkAPI;

/**
 * Initialize the preload bridge.
 */
export function initPreloadBridge(): void {
	contextBridge.exposeInMainWorld('spark', sparkAPI);
}
