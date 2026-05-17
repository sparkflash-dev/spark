/**
 * ETA calculator with exponential smoothing.
 * Provides more stable time estimates compared to simple linear calculation.
 */

export class ETACalculator {
	private alpha: number;
	private smoothedSpeed: number = 0;
	private lastUpdate: number = 0;
	private totalBytes: number;
	private started: boolean = false;

	/**
	 * @param totalBytes Total bytes to process
	 * @param alpha Smoothing factor (0-1). Lower = smoother, higher = more responsive.
	 */
	constructor(totalBytes: number, alpha: number = 0.3) {
		this.totalBytes = totalBytes;
		this.alpha = alpha;
	}

	/**
	 * Update with current progress.
	 * @returns Estimated seconds remaining, or null if insufficient data.
	 */
	update(bytesProcessed: number): number | null {
		const now = Date.now();

		if (!this.started) {
			this.lastUpdate = now;
			this.started = true;
			return null;
		}

		const elapsed = (now - this.lastUpdate) / 1000;
		if (elapsed < 0.1) return this.getETA(bytesProcessed);

		const instantSpeed = bytesProcessed / ((now - this.lastUpdate) / 1000);

		// Exponential moving average
		if (this.smoothedSpeed === 0) {
			this.smoothedSpeed = instantSpeed;
		} else {
			this.smoothedSpeed = this.alpha * instantSpeed + (1 - this.alpha) * this.smoothedSpeed;
		}

		return this.getETA(bytesProcessed);
	}

	/**
	 * Get current ETA in seconds.
	 */
	private getETA(bytesProcessed: number): number | null {
		if (this.smoothedSpeed <= 0) return null;
		const remaining = this.totalBytes - bytesProcessed;
		if (remaining <= 0) return 0;
		return remaining / this.smoothedSpeed;
	}

	/**
	 * Get current smoothed speed in bytes/sec.
	 */
	getSpeed(): number {
		return this.smoothedSpeed;
	}

	/**
	 * Reset the calculator.
	 */
	reset(newTotal?: number): void {
		this.smoothedSpeed = 0;
		this.lastUpdate = 0;
		this.started = false;
		if (newTotal !== undefined) this.totalBytes = newTotal;
	}
}

/**
 * Format ETA for display, with "almost done" for very short times.
 */
export function formatETA(seconds: number | null): string {
	if (seconds === null) return 'Calculating...';
	if (seconds <= 0) return 'Almost done';
	if (seconds < 5) return 'A few seconds';
	if (seconds < 60) return `${Math.ceil(seconds)}s remaining`;
	if (seconds < 3600) {
		const m = Math.floor(seconds / 60);
		const s = Math.ceil(seconds % 60);
		return `${m}m ${s}s remaining`;
	}
	const h = Math.floor(seconds / 3600);
	const m = Math.ceil((seconds % 3600) / 60);
	return `${h}h ${m}m remaining`;
}
