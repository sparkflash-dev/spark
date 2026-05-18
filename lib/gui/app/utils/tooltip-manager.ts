/**
 * Tooltip content manager.
 * Generates contextual tooltip strings for UI elements.
 */

/**
 * Get tooltip for drive selection item.
 */
export function getDriveTooltip(drive: {
	description: string;
	device: string;
	size: number;
	busType: string;
	mountpoints: string[];
}): string {
	const lines = [
		drive.description || drive.device,
		`Device: ${drive.device}`,
		`Size: ${formatSize(drive.size)}`,
		`Bus: ${drive.busType || 'Unknown'}`,
	];

	if (drive.mountpoints.length > 0) {
		lines.push(`Mounted: ${drive.mountpoints.join(', ')}`);
	}

	return lines.join('\n');
}

/**
 * Get tooltip for progress bar.
 */
export function getProgressTooltip(phase: string, percentage: number, speed: number, eta: number | null): string {
	const phaseLabel = phase === 'flashing' ? 'Writing' : phase === 'verifying' ? 'Verifying' : phase;
	const lines = [
		`${phaseLabel}: ${percentage.toFixed(1)}%`,
		`Speed: ${(speed / (1024 * 1024)).toFixed(1)} MB/s`,
	];

	if (eta !== null && eta > 0) {
		lines.push(`ETA: ${formatETA(eta)}`);
	}

	return lines.join('\n');
}

/**
 * Get tooltip for image source.
 */
export function getSourceTooltip(imagePath: string, imageSize: number, compressed: boolean): string {
	const lines = [
		imagePath,
		`Size: ${formatSize(imageSize)}`,
	];
	if (compressed) {
		lines.push('(compressed)');
	}
	return lines.join('\n');
}

function formatSize(bytes: number): string {
	if (bytes <= 0) return 'Unknown';
	const gb = bytes / (1024 * 1024 * 1024);
	if (gb >= 1) return `${gb.toFixed(1)} GB`;
	return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

function formatETA(seconds: number): string {
	if (seconds < 60) return `~${Math.ceil(seconds)}s`;
	const m = Math.floor(seconds / 60);
	return `~${m}m`;
}
