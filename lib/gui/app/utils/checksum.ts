/**
 * SHA256 checksum verification for image files.
 * Automatically detects .sha256sum / .sha256 sidecar files and verifies integrity.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ChecksumResult {
	verified: boolean;
	expected?: string;
	actual?: string;
	checksumFile?: string;
	error?: string;
}

const CHECKSUM_EXTENSIONS = ['.sha256sum', '.sha256', '.SHA256SUM', '.SHA256'];

/**
 * Find a checksum sidecar file for the given image path.
 * Checks for imagename.sha256sum, imagename.sha256, etc.
 */
export function findChecksumFile(imagePath: string): string | null {
	for (const ext of CHECKSUM_EXTENSIONS) {
		const checksumPath = imagePath + ext;
		if (fs.existsSync(checksumPath)) {
			return checksumPath;
		}
	}
	return null;
}

/**
 * Parse a sha256sum file and extract the expected hash for the given image.
 * Supports standard sha256sum format: "hash  filename" or "hash *filename"
 */
function parseChecksumFile(
	checksumPath: string,
	imagePath: string,
): string | null {
	const content = fs.readFileSync(checksumPath, 'utf-8').trim();
	const imageBasename = path.basename(imagePath);

	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		// Format: "hash  filename" or "hash *filename" or just "hash"
		const match = trimmed.match(/^([a-fA-F0-9]{64})\s+\*?(.+)$/);
		if (match) {
			const [, hash, filename] = match;
			if (filename.trim() === imageBasename) {
				return hash.toLowerCase();
			}
		}

		// If the file contains only a hash (no filename), use it directly
		if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
			return trimmed.toLowerCase();
		}
	}

	return null;
}

/**
 * Compute SHA256 hash of a file, with progress callback.
 */
export function computeSHA256(
	filePath: string,
	onProgress?: (percent: number) => void,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash('sha256');
		const stat = fs.statSync(filePath);
		const totalSize = stat.size;
		let processedSize = 0;

		const stream = fs.createReadStream(filePath);

		stream.on('data', (chunk: Buffer) => {
			hash.update(chunk);
			processedSize += chunk.length;
			if (onProgress && totalSize > 0) {
				onProgress(Math.round((processedSize / totalSize) * 100));
			}
		});

		stream.on('end', () => {
			resolve(hash.digest('hex'));
		});

		stream.on('error', (err) => {
			reject(err);
		});
	});
}

/**
 * Verify the checksum of an image file against its sidecar .sha256sum file.
 * Returns null if no checksum file was found.
 */
export async function verifyChecksum(
	imagePath: string,
	onProgress?: (percent: number) => void,
): Promise<ChecksumResult | null> {
	const checksumFile = findChecksumFile(imagePath);
	if (!checksumFile) {
		return null;
	}

	try {
		const expected = parseChecksumFile(checksumFile, imagePath);
		if (!expected) {
			return {
				verified: false,
				checksumFile,
				error: 'Could not find matching hash in checksum file',
			};
		}

		const actual = await computeSHA256(imagePath, onProgress);

		return {
			verified: expected === actual,
			expected,
			actual,
			checksumFile,
		};
	} catch (err: any) {
		return {
			verified: false,
			checksumFile,
			error: err.message,
		};
	}
}
