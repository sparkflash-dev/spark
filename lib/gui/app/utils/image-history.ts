/**
 * Image history — tracks recently flashed images for quick re-selection.
 * Persisted to the Spark config directory alongside settings.
 */

import * as electron from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface HistoryEntry {
	imagePath: string;
	imageName: string;
	imageSize?: number;
	flashedAt: number; // Unix timestamp
	success: boolean;
	targetCount: number;
}

const MAX_HISTORY = 20;
const HISTORY_FILE = 'flash-history.json';

function getHistoryPath(): string {
	const app = electron.app || require('@electron/remote').app;
	return path.join(app.getPath('userData'), HISTORY_FILE);
}

function readHistory(): HistoryEntry[] {
	try {
		const data = fs.readFileSync(getHistoryPath(), 'utf-8');
		const parsed = JSON.parse(data);
		if (Array.isArray(parsed)) {
			return parsed;
		}
	} catch {
		// File doesn't exist or is corrupted
	}
	return [];
}

function writeHistory(entries: HistoryEntry[]): void {
	try {
		fs.writeFileSync(
			getHistoryPath(),
			JSON.stringify(entries, null, 2),
		);
	} catch (err) {
		console.error('Failed to write flash history:', err);
	}
}

/**
 * Add a flash operation to history.
 */
export function addToHistory(entry: Omit<HistoryEntry, 'flashedAt'>): void {
	const history = readHistory();
	history.unshift({
		...entry,
		flashedAt: Date.now(),
	});

	// Keep only the most recent entries
	if (history.length > MAX_HISTORY) {
		history.length = MAX_HISTORY;
	}

	writeHistory(history);
}

/**
 * Get the flash history, most recent first.
 */
export function getHistory(): HistoryEntry[] {
	return readHistory();
}

/**
 * Clear all flash history.
 */
export function clearHistory(): void {
	writeHistory([]);
}

/**
 * Get the most recently flashed image path (for quick re-flash).
 */
export function getLastFlashedImage(): HistoryEntry | null {
	const history = readHistory();
	return history.length > 0 ? history[0] : null;
}

/**
 * Remove entries for images that no longer exist on disk.
 */
export function pruneHistory(): number {
	const history = readHistory();
	const before = history.length;
	const pruned = history.filter((entry) => {
		try {
			return fs.existsSync(entry.imagePath);
		} catch {
			return false;
		}
	});
	writeHistory(pruned);
	return before - pruned.length;
}
