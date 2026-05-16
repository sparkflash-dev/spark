/**
 * Window state persistence.
 * Remembers window position and size between sessions.
 */

import * as fs from 'fs';
import * as path from 'path';
import { app, BrowserWindow } from 'electron';

const STATE_FILE = 'window-state.json';

export interface WindowState {
	x?: number;
	y?: number;
	width: number;
	height: number;
	isMaximized: boolean;
}

const DEFAULT_STATE: WindowState = {
	width: 860,
	height: 520,
	isMaximized: false,
};

function getStatePath(): string {
	try {
		return path.join(app.getPath('userData'), STATE_FILE);
	} catch {
		return path.join(process.env.HOME || '/tmp', '.spark', STATE_FILE);
	}
}

/**
 * Load saved window state from disk.
 */
export function loadWindowState(): WindowState {
	try {
		const filePath = getStatePath();
		if (!fs.existsSync(filePath)) return DEFAULT_STATE;
		const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
		return {
			x: data.x,
			y: data.y,
			width: data.width || DEFAULT_STATE.width,
			height: data.height || DEFAULT_STATE.height,
			isMaximized: data.isMaximized || false,
		};
	} catch {
		return DEFAULT_STATE;
	}
}

/**
 * Save window state to disk.
 */
export function saveWindowState(window: BrowserWindow): void {
	try {
		const bounds = window.getBounds();
		const state: WindowState = {
			x: bounds.x,
			y: bounds.y,
			width: bounds.width,
			height: bounds.height,
			isMaximized: window.isMaximized(),
		};
		const filePath = getStatePath();
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
	} catch {
		// Non-critical — silently fail
	}
}

/**
 * Attach state tracking to a window.
 */
export function trackWindowState(window: BrowserWindow): void {
	const save = () => saveWindowState(window);
	window.on('close', save);
	window.on('resize', save);
	window.on('move', save);
}
