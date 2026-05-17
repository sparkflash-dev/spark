/**
 * System information collector for "About" dialog and bug reports.
 * Gathers hardware/software details without external network calls.
 */

import * as os from 'os';

export interface SystemInfo {
	app: {
		name: string;
		version: string;
	};
	os: {
		platform: string;
		release: string;
		arch: string;
		hostname: string;
	};
	hardware: {
		cpuModel: string;
		cpuCores: number;
		totalMemory: string;
		freeMemory: string;
	};
	runtime: {
		node: string;
		electron: string;
		v8: string;
		chrome: string;
	};
}

/**
 * Collect system information.
 */
export function collectSystemInfo(): SystemInfo {
	const cpus = os.cpus();
	return {
		app: {
			name: 'Spark',
			version: getAppVersion(),
		},
		os: {
			platform: getPlatformName(),
			release: os.release(),
			arch: os.arch(),
			hostname: os.hostname(),
		},
		hardware: {
			cpuModel: cpus.length > 0 ? cpus[0].model.trim() : 'Unknown',
			cpuCores: cpus.length,
			totalMemory: formatBytes(os.totalmem()),
			freeMemory: formatBytes(os.freemem()),
		},
		runtime: {
			node: process.versions.node || 'N/A',
			electron: process.versions.electron || 'N/A',
			v8: process.versions.v8 || 'N/A',
			chrome: process.versions.chrome || 'N/A',
		},
	};
}

/**
 * Format system info as a string for bug reports.
 */
export function formatSystemInfo(info: SystemInfo): string {
	return [
		`${info.app.name} v${info.app.version}`,
		`OS: ${info.os.platform} ${info.os.release} (${info.os.arch})`,
		`CPU: ${info.hardware.cpuModel} (${info.hardware.cpuCores} cores)`,
		`Memory: ${info.hardware.freeMemory} free / ${info.hardware.totalMemory} total`,
		`Electron: ${info.runtime.electron}, Node: ${info.runtime.node}`,
	].join('\n');
}

/**
 * Copy system info to clipboard (renderer process).
 */
export function getSystemInfoText(): string {
	return formatSystemInfo(collectSystemInfo());
}

function getPlatformName(): string {
	switch (os.platform()) {
		case 'linux': return 'Linux';
		case 'darwin': return 'macOS';
		case 'win32': return 'Windows';
		default: return os.platform();
	}
}

function formatBytes(bytes: number): string {
	const gb = bytes / (1024 * 1024 * 1024);
	return `${gb.toFixed(1)} GB`;
}

function getAppVersion(): string {
	try {
		return require('../../../../package.json').version;
	} catch {
		return 'unknown';
	}
}
