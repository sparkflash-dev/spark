/**
 * Streaming hash computation for large files.
 * Avoids loading entire file into memory for checksum verification.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';

export type HashAlgorithm = 'sha256' | 'sha512' | 'md5' | 'sha1';

export interface HashResult {
	algorithm: HashAlgorithm;
	hash: string;
	bytesProcessed: number;
	durationMs: number;
}

/**
 * Compute a hash of a file using streaming reads.
 */
export function hashFileStream(
	filePath: string,
	algorithm: HashAlgorithm = 'sha256',
	onProgress?: (bytesRead: number, totalBytes: number) => void,
): Promise<HashResult> {
	return new Promise((resolve, reject) => {
		const stat = fs.statSync(filePath);
		const totalBytes = stat.size;
		const startTime = Date.now();
		let bytesProcessed = 0;

		const hash = crypto.createHash(algorithm);
		const stream = fs.createReadStream(filePath, { highWaterMark: 4 * 1024 * 1024 });

		stream.on('data', (chunk: Buffer) => {
			hash.update(chunk);
			bytesProcessed += chunk.length;
			if (onProgress) {
				onProgress(bytesProcessed, totalBytes);
			}
		});

		stream.on('end', () => {
			resolve({
				algorithm,
				hash: hash.digest('hex'),
				bytesProcessed,
				durationMs: Date.now() - startTime,
			});
		});

		stream.on('error', (err) => {
			reject(err);
		});
	});
}

/**
 * Verify a file against an expected hash.
 */
export async function verifyFileHash(
	filePath: string,
	expectedHash: string,
	algorithm: HashAlgorithm = 'sha256',
	onProgress?: (bytesRead: number, totalBytes: number) => void,
): Promise<boolean> {
	const result = await hashFileStream(filePath, algorithm, onProgress);
	return result.hash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Detect hash algorithm from hash string length.
 */
export function detectAlgorithm(hashString: string): HashAlgorithm | null {
	const len = hashString.length;
	if (len === 32) return 'md5';
	if (len === 40) return 'sha1';
	if (len === 64) return 'sha256';
	if (len === 128) return 'sha512';
	return null;
}
