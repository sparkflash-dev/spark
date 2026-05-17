/**
 * Flash operation summary generation.
 * Creates human-readable summaries for completed flash operations.
 */

export interface FlashResult {
	imageName: string;
	imageSize: number;
	targets: Array<{
		device: string;
		name: string;
		success: boolean;
		error?: string;
	}>;
	startTime: number;
	endTime: number;
	verified: boolean;
	averageSpeed: number;
}

/**
 * Generate a human-readable summary of a flash operation.
 */
export function generateSummary(result: FlashResult): string {
	const duration = formatDuration(result.endTime - result.startTime);
	const successful = result.targets.filter((t) => t.success).length;
	const failed = result.targets.filter((t) => !t.success).length;
	const speed = formatSpeed(result.averageSpeed);

	const lines: string[] = [];
	lines.push(`Image: ${result.imageName} (${formatSize(result.imageSize)})`);
	lines.push(`Duration: ${duration}`);
	lines.push(`Average speed: ${speed}`);
	lines.push(`Targets: ${successful} succeeded${failed > 0 ? `, ${failed} failed` : ''}`);
	lines.push(`Verification: ${result.verified ? 'passed' : 'skipped'}`);

	if (failed > 0) {
		lines.push('');
		lines.push('Failed targets:');
		for (const t of result.targets.filter((t) => !t.success)) {
			lines.push(`  - ${t.device} (${t.name}): ${t.error || 'unknown error'}`);
		}
	}

	return lines.join('\n');
}

/**
 * Generate a one-line status for notifications.
 */
export function generateShortSummary(result: FlashResult): string {
	const successful = result.targets.filter((t) => t.success).length;
	const total = result.targets.length;
	const duration = formatDuration(result.endTime - result.startTime);

	if (successful === total) {
		return `${result.imageName} → ${total} target${total > 1 ? 's' : ''} in ${duration}`;
	}
	return `${result.imageName} → ${successful}/${total} succeeded in ${duration}`;
}

function formatDuration(ms: number): string {
	const s = Math.round(ms / 1000);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	return `${m}m ${s % 60}s`;
}

function formatSize(bytes: number): string {
	const gb = bytes / (1024 * 1024 * 1024);
	if (gb >= 1) return `${gb.toFixed(1)} GB`;
	return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

function formatSpeed(bps: number): string {
	return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
}
