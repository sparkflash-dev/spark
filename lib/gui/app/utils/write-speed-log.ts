/**
 * Write speed logging — tracks historical write speeds for performance analysis.
 * Stored alongside flash history for analytics and debugging.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';

export interface SpeedLogEntry {
	timestamp: number;
	imageName: string;
	imageSize: number;
	driveDescription: string;
	averageSpeedMBps: number;
	peakSpeedMBps: number;
	durationSeconds: number;
	verified: boolean;
}

const MAX_ENTRIES = 50;
const LOG_FILE = 'speed-log.json';

function getLogPath(): string {
	const app = electron.app || require('@electron/remote').app;
	return path.join(app.getPath('userData'), LOG_FILE);
}

function readLog(): SpeedLogEntry[] {
	try {
		const data = fs.readFileSync(getLogPath(), 'utf-8');
		const parsed = JSON.parse(data);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function writeLog(entries: SpeedLogEntry[]): void {
	try {
		fs.writeFileSync(getLogPath(), JSON.stringify(entries, null, 2));
	} catch (err) {
		console.error('Failed to write speed log:', err);
	}
}

/**
 * Record a completed write operation.
 */
export function logWriteSpeed(entry: SpeedLogEntry): void {
	const log = readLog();
	log.unshift(entry);
	if (log.length > MAX_ENTRIES) log.length = MAX_ENTRIES;
	writeLog(log);
}

/**
 * Get historical speed entries.
 */
export function getSpeedLog(): SpeedLogEntry[] {
	return readLog();
}

/**
 * Get average write speed across all logged operations.
 */
export function getAverageSpeed(): number {
	const log = readLog();
	if (log.length === 0) return 0;
	const total = log.reduce((sum, e) => sum + e.averageSpeedMBps, 0);
	return Math.round((total / log.length) * 10) / 10;
}

/**
 * Clear speed log.
 */
export function clearSpeedLog(): void {
	writeLog([]);
}
