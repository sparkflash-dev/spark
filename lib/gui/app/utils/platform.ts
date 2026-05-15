/**
 * Platform detection utilities for Spark.
 * Provides helpers for platform-specific behavior.
 */

import * as os from 'os';

export type Platform = 'linux' | 'darwin' | 'win32';

/**
 * Get the current platform.
 */
export function getPlatform(): Platform {
	return os.platform() as Platform;
}

/**
 * Check if running on Linux.
 */
export function isLinux(): boolean {
	return os.platform() === 'linux';
}

/**
 * Check if running on macOS.
 */
export function isMacOS(): boolean {
	return os.platform() === 'darwin';
}

/**
 * Check if running on Windows.
 */
export function isWindows(): boolean {
	return os.platform() === 'win32';
}

/**
 * Check if running with elevated privileges.
 */
export function isElevated(): boolean {
	if (os.platform() === 'win32') {
		try {
			const { execSync } = require('child_process');
			execSync('net session', { stdio: 'ignore' });
			return true;
		} catch {
			return false;
		}
	}
	return process.getuid?.() === 0;
}

/**
 * Get the default temp directory for the platform.
 */
export function getTempDir(): string {
	return os.tmpdir();
}

/**
 * Get display-friendly OS name.
 */
export function getOSName(): string {
	const platform = os.platform();
	const release = os.release();
	switch (platform) {
		case 'linux': return `Linux ${release}`;
		case 'darwin': return `macOS ${release}`;
		case 'win32': return `Windows ${release}`;
		default: return `${platform} ${release}`;
	}
}

/**
 * Check if the system supports notifications.
 */
export function supportsNotifications(): boolean {
	if (typeof Notification === 'undefined') return false;
	return Notification.permission !== 'denied';
}
