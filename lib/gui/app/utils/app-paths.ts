/**
 * Application path helpers.
 * Provides consistent access to app directories across platforms.
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const APP_NAME = 'spark';

/**
 * Get the user data directory for Spark.
 */
export function getUserDataDir(): string {
	const platform = os.platform();
	const home = os.homedir();

	let dir: string;
	if (platform === 'win32') {
		dir = path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), APP_NAME);
	} else if (platform === 'darwin') {
		dir = path.join(home, 'Library', 'Application Support', APP_NAME);
	} else {
		dir = path.join(process.env.XDG_DATA_HOME || path.join(home, '.local', 'share'), APP_NAME);
	}

	ensureDir(dir);
	return dir;
}

/**
 * Get the config directory.
 */
export function getConfigDir(): string {
	const platform = os.platform();
	const home = os.homedir();

	if (platform === 'linux') {
		const dir = path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), APP_NAME);
		ensureDir(dir);
		return dir;
	}
	return getUserDataDir();
}

/**
 * Get the log directory.
 */
export function getLogDir(): string {
	const dir = path.join(getUserDataDir(), 'logs');
	ensureDir(dir);
	return dir;
}

/**
 * Get the temp directory for Spark operations.
 */
export function getTempDir(): string {
	const dir = path.join(os.tmpdir(), APP_NAME);
	ensureDir(dir);
	return dir;
}

/**
 * Get the crash reports directory.
 */
export function getCrashDir(): string {
	const dir = path.join(getUserDataDir(), 'crashes');
	ensureDir(dir);
	return dir;
}

/**
 * Ensure a directory exists.
 */
function ensureDir(dir: string): void {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}
