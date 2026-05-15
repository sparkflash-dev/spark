/**
 * Progress calculation utilities.
 * Smooths progress updates and calculates ETA.
 */

export interface ProgressState {
	percentage: number;
	speed: number;
	eta: number | null;
	elapsed: number;
	bytesWritten: number;
	totalBytes: number;
}

export class ProgressCalculator {
	private startTime: number;
	private samples: Array<{ time: number; bytes: number }> = [];
	private readonly maxSamples = 20;
	private totalBytes: number;

	constructor(totalBytes: number) {
		this.totalBytes = totalBytes;
		this.startTime = Date.now();
	}

	/**
	 * Record a progress sample.
	 */
	update(bytesWritten: number): ProgressState {
		const now = Date.now();
		this.samples.push({ time: now, bytes: bytesWritten });

		if (this.samples.length > this.maxSamples) {
			this.samples.shift();
		}

		const speed = this.calculateSpeed();
		const remaining = this.totalBytes - bytesWritten;
		const eta = speed > 0 ? remaining / speed : null;

		return {
			percentage: this.totalBytes > 0 ? (bytesWritten / this.totalBytes) * 100 : 0,
			speed,
			eta,
			elapsed: (now - this.startTime) / 1000,
			bytesWritten,
			totalBytes: this.totalBytes,
		};
	}

	/**
	 * Calculate current write speed using sliding window average.
	 */
	private calculateSpeed(): number {
		if (this.samples.length < 2) return 0;

		const first = this.samples[0];
		const last = this.samples[this.samples.length - 1];
		const timeDiff = (last.time - first.time) / 1000;
		const bytesDiff = last.bytes - first.bytes;

		return timeDiff > 0 ? bytesDiff / timeDiff : 0;
	}

	/**
	 * Reset the calculator.
	 */
	reset(newTotalBytes?: number): void {
		this.startTime = Date.now();
		this.samples = [];
		if (newTotalBytes !== undefined) {
			this.totalBytes = newTotalBytes;
		}
	}
}

/**
 * Format a duration in seconds to human-readable string.
 */
export function formatDuration(seconds: number): string {
	if (seconds < 0) return '--';
	if (seconds < 60) return `${Math.round(seconds)}s`;
	if (seconds < 3600) {
		const m = Math.floor(seconds / 60);
		const s = Math.round(seconds % 60);
		return s > 0 ? `${m}m ${s}s` : `${m}m`;
	}
	const h = Math.floor(seconds / 3600);
	const m = Math.round((seconds % 3600) / 60);
	return `${h}h ${m}m`;
}

/**
 * Format bytes per second to human-readable speed.
 */
export function formatSpeed(bytesPerSecond: number): string {
	const mbps = bytesPerSecond / (1024 * 1024);
	if (mbps >= 1000) return `${(mbps / 1024).toFixed(1)} GB/s`;
	if (mbps >= 1) return `${mbps.toFixed(1)} MB/s`;
	return `${(bytesPerSecond / 1024).toFixed(0)} KB/s`;
}
