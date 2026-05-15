/**
 * Safe drive unmount utilities.
 * Ensures drives are properly unmounted before flash and optionally ejected after.
 */

import { execSync } from 'child_process';
import * as os from 'os';

export interface UnmountResult {
	success: boolean;
	device: string;
	error?: string;
}

/**
 * Unmount a drive safely before writing.
 */
export function unmountDrive(devicePath: string): UnmountResult {
	const platform = os.platform();

	try {
		if (platform === 'linux') {
			// Unmount all partitions of the device
			execSync(`umount ${devicePath}* 2>/dev/null || true`, { timeout: 10000 });
		} else if (platform === 'darwin') {
			execSync(`diskutil unmountDisk ${devicePath}`, { timeout: 10000 });
		} else if (platform === 'win32') {
			// On Windows, we rely on the SDK's built-in unmount
			return { success: true, device: devicePath };
		}
		return { success: true, device: devicePath };
	} catch (err: any) {
		return {
			success: false,
			device: devicePath,
			error: err.message || 'Unknown unmount error',
		};
	}
}

/**
 * Eject a drive after successful write.
 */
export function ejectDrive(devicePath: string): UnmountResult {
	const platform = os.platform();

	try {
		if (platform === 'linux') {
			execSync(`eject ${devicePath} 2>/dev/null || udisksctl power-off -b ${devicePath} 2>/dev/null || true`, {
				timeout: 10000,
			});
		} else if (platform === 'darwin') {
			execSync(`diskutil eject ${devicePath}`, { timeout: 10000 });
		} else if (platform === 'win32') {
			// Windows eject via PowerShell
			const script = `(New-Object -comObject Shell.Application).Namespace(17).ParseName("${devicePath}").InvokeVerb("Eject")`;
			execSync(`powershell -Command "${script}"`, { timeout: 10000 });
		}
		return { success: true, device: devicePath };
	} catch (err: any) {
		return {
			success: false,
			device: devicePath,
			error: err.message || 'Unknown eject error',
		};
	}
}

/**
 * Check if a device is currently mounted.
 */
export function isMounted(devicePath: string): boolean {
	const platform = os.platform();

	try {
		if (platform === 'linux' || platform === 'darwin') {
			const output = execSync('mount', { encoding: 'utf-8' });
			return output.includes(devicePath);
		}
	} catch {
		return false;
	}
	return false;
}
