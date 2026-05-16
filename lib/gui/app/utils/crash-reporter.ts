/**
 * Crash reporter for Spark.
 * Captures unhandled exceptions and writes crash dumps locally.
 * No data is ever sent externally — zero telemetry policy.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const MAX_CRASH_FILES = 10;

interface CrashReport {
	timestamp: string;
	version: string;
	platform: string;
	arch: string;
	nodeVersion: string;
	electronVersion: string;
	error: {
		name: string;
		message: string;
		stack?: string;
	};
	memoryUsage: NodeJS.MemoryUsage;
}

function getCrashDir(): string {
	const homeDir = os.homedir();
	return path.join(homeDir, '.spark', 'crashes');
}

/**
 * Initialize crash reporter — registers global error handlers.
 */
export function initCrashReporter(): void {
	process.on('uncaughtException', (error) => {
		writeCrashReport(error);
	});

	process.on('unhandledRejection', (reason) => {
		const error = reason instanceof Error ? reason : new Error(String(reason));
		writeCrashReport(error);
	});
}

/**
 * Write a crash report to disk.
 */
export function writeCrashReport(error: Error): string | null {
	try {
		const crashDir = getCrashDir();
		if (!fs.existsSync(crashDir)) {
			fs.mkdirSync(crashDir, { recursive: true });
		}

		const report: CrashReport = {
			timestamp: new Date().toISOString(),
			version: getVersion(),
			platform: os.platform(),
			arch: os.arch(),
			nodeVersion: process.version,
			electronVersion: process.versions.electron || 'N/A',
			error: {
				name: error.name,
				message: error.message,
				stack: error.stack,
			},
			memoryUsage: process.memoryUsage(),
		};

		const filename = `crash-${Date.now()}.json`;
		const filePath = path.join(crashDir, filename);
		fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

		// Prune old crash files
		pruneOldReports(crashDir);

		return filePath;
	} catch {
		return null;
	}
}

/**
 * Remove old crash reports beyond MAX_CRASH_FILES.
 */
function pruneOldReports(crashDir: string): void {
	try {
		const files = fs.readdirSync(crashDir)
			.filter((f) => f.startsWith('crash-') && f.endsWith('.json'))
			.sort()
			.reverse();

		for (let i = MAX_CRASH_FILES; i < files.length; i++) {
			fs.unlinkSync(path.join(crashDir, files[i]));
		}
	} catch {
		// Best effort
	}
}

/**
 * Get all crash reports.
 */
export function getCrashReports(): CrashReport[] {
	try {
		const crashDir = getCrashDir();
		if (!fs.existsSync(crashDir)) return [];
		return fs.readdirSync(crashDir)
			.filter((f) => f.startsWith('crash-') && f.endsWith('.json'))
			.sort()
			.reverse()
			.map((f) => JSON.parse(fs.readFileSync(path.join(crashDir, f), 'utf-8')));
	} catch {
		return [];
	}
}

function getVersion(): string {
	try {
		return require('../../../../package.json').version;
	} catch {
		return 'unknown';
	}
}
