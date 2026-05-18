/**
 * Session timer — tracks total app usage and flash operation durations.
 * Provides metrics for the settings/about screen.
 */

export interface SessionStats {
	sessionStart: number;
	totalFlashes: number;
	totalBytesWritten: number;
	totalDuration: number;
	lastFlashTime: number | null;
}

let stats: SessionStats = {
	sessionStart: Date.now(),
	totalFlashes: 0,
	totalBytesWritten: 0,
	totalDuration: 0,
	lastFlashTime: null,
};

/**
 * Record a completed flash operation.
 */
export function recordFlash(bytesWritten: number, durationMs: number): void {
	stats.totalFlashes++;
	stats.totalBytesWritten += bytesWritten;
	stats.totalDuration += durationMs;
	stats.lastFlashTime = Date.now();
}

/**
 * Get current session statistics.
 */
export function getSessionStats(): SessionStats {
	return { ...stats };
}

/**
 * Get session uptime in seconds.
 */
export function getUptime(): number {
	return (Date.now() - stats.sessionStart) / 1000;
}

/**
 * Format session stats for display.
 */
export function formatSessionStats(): string {
	const uptime = getUptime();
	const hours = Math.floor(uptime / 3600);
	const minutes = Math.floor((uptime % 3600) / 60);

	const lines = [];
	if (hours > 0) {
		lines.push(`Session: ${hours}h ${minutes}m`);
	} else {
		lines.push(`Session: ${minutes}m`);
	}

	if (stats.totalFlashes > 0) {
		const gb = (stats.totalBytesWritten / (1024 * 1024 * 1024)).toFixed(1);
		lines.push(`Flashes: ${stats.totalFlashes}`);
		lines.push(`Written: ${gb} GB`);
	}

	return lines.join(' | ');
}

/**
 * Reset session stats (for testing).
 */
export function resetStats(): void {
	stats = {
		sessionStart: Date.now(),
		totalFlashes: 0,
		totalBytesWritten: 0,
		totalDuration: 0,
		lastFlashTime: null,
	};
}
