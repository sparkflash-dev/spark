/**
 * Rate limiter for UI updates and API calls.
 * Prevents excessive re-renders during fast progress updates.
 */

export class RateLimiter {
	private lastCall: number = 0;
	private intervalMs: number;
	private pending: ReturnType<typeof setTimeout> | null = null;

	constructor(intervalMs: number = 100) {
		this.intervalMs = intervalMs;
	}

	/**
	 * Execute callback if enough time has passed since last call.
	 * Trailing call is guaranteed — the last update is never dropped.
	 */
	call(fn: () => void): void {
		const now = Date.now();
		const elapsed = now - this.lastCall;

		if (elapsed >= this.intervalMs) {
			this.lastCall = now;
			if (this.pending) {
				clearTimeout(this.pending);
				this.pending = null;
			}
			fn();
		} else {
			// Schedule trailing call
			if (this.pending) clearTimeout(this.pending);
			this.pending = setTimeout(() => {
				this.lastCall = Date.now();
				this.pending = null;
				fn();
			}, this.intervalMs - elapsed);
		}
	}

	/**
	 * Cancel any pending trailing call.
	 */
	cancel(): void {
		if (this.pending) {
			clearTimeout(this.pending);
			this.pending = null;
		}
	}

	/**
	 * Reset the limiter state.
	 */
	reset(): void {
		this.cancel();
		this.lastCall = 0;
	}
}

/**
 * Create a throttled version of a function.
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, intervalMs: number): T {
	const limiter = new RateLimiter(intervalMs);
	return ((...args: any[]) => {
		limiter.call(() => fn(...args));
	}) as T;
}

/**
 * Create a debounced version of a function.
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return ((...args: any[]) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			fn(...args);
		}, delayMs);
	}) as T;
}
