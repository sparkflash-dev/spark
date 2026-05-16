/**
 * Electron sandbox and security configuration.
 * Enforces security best practices for the renderer process.
 */

import { BrowserWindow } from 'electron';

export interface SecurityConfig {
	sandbox: boolean;
	contextIsolation: boolean;
	nodeIntegration: boolean;
	webSecurity: boolean;
	allowRunningInsecureContent: boolean;
	experimentalFeatures: boolean;
}

/**
 * Production security configuration — maximum restrictions.
 */
export const PRODUCTION_SECURITY: SecurityConfig = {
	sandbox: true,
	contextIsolation: true,
	nodeIntegration: false,
	webSecurity: true,
	allowRunningInsecureContent: false,
	experimentalFeatures: false,
};

/**
 * Development security configuration — slightly relaxed for debugging.
 */
export const DEVELOPMENT_SECURITY: SecurityConfig = {
	sandbox: false, // Required for electron-forge dev mode
	contextIsolation: true,
	nodeIntegration: false,
	webSecurity: true,
	allowRunningInsecureContent: false,
	experimentalFeatures: false,
};

/**
 * Get security config based on environment.
 */
export function getSecurityConfig(): SecurityConfig {
	const isDev = process.env.NODE_ENV === 'development' || process.env.SPARK_DEV === '1';
	return isDev ? DEVELOPMENT_SECURITY : PRODUCTION_SECURITY;
}

/**
 * Apply security restrictions to web preferences.
 */
export function getSecureWebPreferences(preloadScript: string): Electron.WebPreferences {
	const config = getSecurityConfig();
	return {
		preload: preloadScript,
		sandbox: config.sandbox,
		contextIsolation: config.contextIsolation,
		nodeIntegration: config.nodeIntegration,
		webSecurity: config.webSecurity,
		allowRunningInsecureContent: config.allowRunningInsecureContent,
		experimentalFeatures: config.experimentalFeatures,
		// Additional hardening
		disableDialogs: false,
		navigateOnDragDrop: false,
		spellcheck: false,
		autoplayPolicy: 'user-gesture-required',
	} as Electron.WebPreferences;
}

/**
 * Attach security event handlers to a window.
 * Prevents navigation and new window creation.
 */
export function attachSecurityHandlers(window: BrowserWindow): void {
	// Prevent navigation away from app
	window.webContents.on('will-navigate', (event, url) => {
		if (!url.startsWith('file://') && !url.startsWith('http://localhost:')) {
			event.preventDefault();
		}
	});

	// Prevent opening new windows
	window.webContents.setWindowOpenHandler(() => {
		return { action: 'deny' };
	});
}
