/**
 * Temporary file cleanup utilities.
 * Manages temp files created during decompression and download operations.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const SPARK_TEMP_PREFIX = 'spark-';
const MAX_TEMP_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

const trackedFiles: Set<string> = new Set();

/**
 * Create a tracked temporary file path.
 */
export function createTempPath(extension: string): string {
	const tmpDir = os.tmpdir();
	const name = `${SPARK_TEMP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
	const fullPath = path.join(tmpDir, name);
	trackedFiles.add(fullPath);
	return fullPath;
}

/**
 * Remove a tracked temporary file.
 */
export function removeTempFile(filePath: string): boolean {
	try {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		trackedFiles.delete(filePath);
		return true;
	} catch {
		return false;
	}
}

/**
 * Clean up all tracked temporary files.
 */
export function cleanupTracked(): number {
	let cleaned = 0;
	for (const file of trackedFiles) {
		if (removeTempFile(file)) cleaned++;
	}
	return cleaned;
}

/**
 * Clean up stale Spark temp files older than MAX_TEMP_AGE.
 */
export function cleanupStale(): number {
	const tmpDir = os.tmpdir();
	let cleaned = 0;
	const now = Date.now();

	try {
		const files = fs.readdirSync(tmpDir).filter((f) => f.startsWith(SPARK_TEMP_PREFIX));
		for (const file of files) {
			const fullPath = path.join(tmpDir, file);
			try {
				const stat = fs.statSync(fullPath);
				if (now - stat.mtimeMs > MAX_TEMP_AGE_MS) {
					fs.unlinkSync(fullPath);
					cleaned++;
				}
			} catch {
				// Skip files we can't stat
			}
		}
	} catch {
		// Can't read tmpdir — non-critical
	}

	return cleaned;
}

/**
 * Get the number of currently tracked temp files.
 */
export function getTrackedCount(): number {
	return trackedFiles.size;
}
