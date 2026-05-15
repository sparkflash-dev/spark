/**
 * Pre-write surface scan for target drives.
 * Reads sample blocks across the drive surface to detect bad sectors
 * before committing to a full write operation.
 */

import * as fs from 'fs';

export interface ScanResult {
	passed: boolean;
	totalSectors: number;
	badSectors: number;
	errors: string[];
	durationMs: number;
}

export interface ScanProgress {
	percent: number;
	sectorsChecked: number;
	totalSectors: number;
	badSectors: number;
}

const BLOCK_SIZE = 4096; // 4KB blocks
const SAMPLE_COUNT = 256; // Number of sample points across the drive

/**
 * Perform a surface scan on a drive by reading sample blocks.
 * Uses a stride pattern to cover the full drive surface efficiently.
 *
 * @param devicePath - Path to the block device (e.g. /dev/sdb)
 * @param deviceSize - Total size of the device in bytes
 * @param onProgress - Progress callback
 * @returns ScanResult with pass/fail status
 */
export async function scanDriveSurface(
	devicePath: string,
	deviceSize: number,
	onProgress?: (progress: ScanProgress) => void,
): Promise<ScanResult> {
	const startTime = Date.now();
	const errors: string[] = [];
	let badSectors = 0;

	// Calculate stride: evenly space sample reads across the drive
	const sampleCount = Math.min(SAMPLE_COUNT, Math.floor(deviceSize / BLOCK_SIZE));
	const stride = Math.floor(deviceSize / sampleCount);

	const buffer = Buffer.alloc(BLOCK_SIZE);

	let fd: number | null = null;
	try {
		fd = fs.openSync(devicePath, 'r');

		for (let i = 0; i < sampleCount; i++) {
			const offset = i * stride;

			try {
				fs.readSync(fd, buffer, 0, BLOCK_SIZE, offset);
			} catch (err: any) {
				badSectors++;
				errors.push(
					`Bad sector at offset ${offset} (${formatBytes(offset)}): ${err.code || err.message}`,
				);
			}

			if (onProgress) {
				onProgress({
					percent: Math.round(((i + 1) / sampleCount) * 100),
					sectorsChecked: i + 1,
					totalSectors: sampleCount,
					badSectors,
				});
			}
		}
	} finally {
		if (fd !== null) {
			fs.closeSync(fd);
		}
	}

	return {
		passed: badSectors === 0,
		totalSectors: sampleCount,
		badSectors,
		errors,
		durationMs: Date.now() - startTime,
	};
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024)
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
