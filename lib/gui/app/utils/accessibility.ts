/**
 * Accessibility helpers for Spark.
 * Provides ARIA labels, keyboard navigation support, and screen reader hints.
 */

/**
 * Get appropriate ARIA label for flash progress.
 */
export function getProgressAriaLabel(
	phase: string,
	percentage: number,
	speed?: number,
): string {
	const phaseNames: Record<string, string> = {
		decompressing: 'Decompressing image',
		flashing: 'Writing to drive',
		verifying: 'Verifying write',
		starting: 'Starting',
		finishing: 'Finishing',
	};

	const phaseName = phaseNames[phase] || phase;
	const speedInfo = speed ? `, ${(speed / (1024 * 1024)).toFixed(1)} megabytes per second` : '';

	return `${phaseName}: ${percentage.toFixed(0)} percent complete${speedInfo}`;
}

/**
 * Get ARIA label for a drive in the target selector.
 */
export function getDriveAriaLabel(
	description: string,
	size: number,
	mountpoints: string[],
): string {
	const sizeGB = (size / (1024 * 1024 * 1024)).toFixed(1);
	const mounts = mountpoints.length > 0 ? `, mounted at ${mountpoints.join(', ')}` : '';
	return `${description}, ${sizeGB} gigabytes${mounts}`;
}

/**
 * Get ARIA label for the source selector state.
 */
export function getSourceAriaLabel(
	imageName?: string,
	imageSize?: number,
	isLoading?: boolean,
): string {
	if (isLoading) return 'Loading image metadata';
	if (!imageName) return 'No image selected. Click to select a source image.';
	const size = imageSize ? `, ${(imageSize / (1024 * 1024 * 1024)).toFixed(1)} gigabytes` : '';
	return `Selected image: ${imageName}${size}`;
}

/**
 * Announce a message to screen readers via a live region.
 */
export function announceToScreenReader(message: string): void {
	const el = document.getElementById('spark-sr-announcer');
	if (el) {
		el.textContent = '';
		// Force re-announcement by clearing and setting in next tick
		setTimeout(() => {
			el.textContent = message;
		}, 50);
	}
}

/**
 * Get keyboard shortcut description for screen readers.
 */
export function getShortcutDescription(key: string, action: string): string {
	return `Press ${key} to ${action}`;
}
