/**
 * Write buffer management for optimal flash performance.
 * Adjusts buffer size based on drive speed and available memory.
 */

import * as os from 'os';

const MIN_BUFFER_SIZE = 512 * 1024; // 512 KB
const MAX_BUFFER_SIZE = 64 * 1024 * 1024; // 64 MB
const DEFAULT_BUFFER_SIZE = 4 * 1024 * 1024; // 4 MB

export interface BufferConfig {
	size: number;
	count: number;
	totalMemory: number;
}

/**
 * Calculate optimal write buffer size based on system resources.
 */
export function calculateBufferSize(driveSpeedBps?: number): BufferConfig {
	const totalMem = os.totalmem();
	const freeMem = os.freemem();
	// Use at most 5% of free memory for buffers
	const maxMemForBuffers = Math.floor(freeMem * 0.05);

	let bufferSize = DEFAULT_BUFFER_SIZE;

	if (driveSpeedBps) {
		// Target ~2 seconds of write data in buffer
		bufferSize = Math.floor(driveSpeedBps * 2);
	}

	// Clamp to valid range
	bufferSize = Math.max(MIN_BUFFER_SIZE, Math.min(MAX_BUFFER_SIZE, bufferSize));

	// Calculate number of buffers (double-buffering minimum)
	const count = Math.max(2, Math.min(8, Math.floor(maxMemForBuffers / bufferSize)));

	return {
		size: bufferSize,
		count,
		totalMemory: bufferSize * count,
	};
}

/**
 * Suggest chunk size for read operations based on source type.
 */
export function getReadChunkSize(isCompressed: boolean, isNetwork: boolean): number {
	if (isNetwork) {
		// Network: smaller chunks for better progress updates
		return 1 * 1024 * 1024; // 1 MB
	}
	if (isCompressed) {
		// Compressed: medium chunks to balance decompression overhead
		return 2 * 1024 * 1024; // 2 MB
	}
	// Raw local file: large chunks for throughput
	return 8 * 1024 * 1024; // 8 MB
}

/**
 * Check if the system has enough memory for the write operation.
 */
export function hasEnoughMemory(imageSize: number): boolean {
	const freeMem = os.freemem();
	// Need at least 256MB free for the app + buffers
	return freeMem > 256 * 1024 * 1024;
}
