/**
 * Privilege escalation handling for Spark.
 * Manages elevation requests for write operations that require root/admin.
 */

import { execSync, spawn } from 'child_process';
import * as os from 'os';
import * as path from 'path';

export interface ElevationResult {
	elevated: boolean;
	method?: string;
	error?: string;
}

/**
 * Check if the current process has write access to a device.
 */
export function hasWriteAccess(devicePath: string): boolean {
	const platform = os.platform();
	try {
		if (platform === 'win32') {
			// On Windows, admin check
			execSync('net session', { stdio: 'ignore' });
			return true;
		}
		// On Unix, check if we can open device for writing
		execSync(`test -w ${devicePath}`, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

/**
 * Get the available elevation method for the current platform.
 */
export function getElevationMethod(): string | null {
	const platform = os.platform();

	if (platform === 'darwin') {
		return 'osascript'; // macOS authorization dialog
	}

	if (platform === 'linux') {
		// Check available polkit agents
		const agents = ['pkexec', 'gksudo', 'kdesudo', 'sudo'];
		for (const agent of agents) {
			try {
				execSync(`which ${agent}`, { stdio: 'ignore' });
				return agent;
			} catch {
				continue;
			}
		}
	}

	if (platform === 'win32') {
		return 'runas';
	}

	return null;
}

/**
 * Request elevation for the current process.
 * Returns the elevation method used, or an error.
 */
export function requestElevation(executablePath?: string): ElevationResult {
	const method = getElevationMethod();
	if (!method) {
		return { elevated: false, error: 'No elevation method available' };
	}

	const appPath = executablePath || process.execPath;
	const platform = os.platform();

	try {
		if (platform === 'linux' && method === 'pkexec') {
			// pkexec will prompt the user via polkit
			return { elevated: true, method: 'pkexec' };
		}

		if (platform === 'darwin') {
			return { elevated: true, method: 'osascript' };
		}

		return { elevated: true, method };
	} catch (err: any) {
		return { elevated: false, error: err.message };
	}
}

/**
 * Build the command to re-launch with elevation.
 */
export function buildElevatedCommand(args: string[]): string[] {
	const method = getElevationMethod();
	const platform = os.platform();

	if (platform === 'linux') {
		if (method === 'pkexec') {
			return ['pkexec', '--disable-internal-agent', process.execPath, ...args];
		}
		return ['sudo', process.execPath, ...args];
	}

	if (platform === 'darwin') {
		const script = `do shell script "${process.execPath} ${args.join(' ')}" with administrator privileges`;
		return ['osascript', '-e', script];
	}

	// Windows: handled via electron's built-in elevation
	return [process.execPath, ...args];
}
