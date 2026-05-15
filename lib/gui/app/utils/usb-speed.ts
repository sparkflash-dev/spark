/**
 * USB speed detection and write speed estimation.
 * Helps users understand expected performance based on connection type.
 */

export type UsbGeneration = 'USB 1.1' | 'USB 2.0' | 'USB 3.0' | 'USB 3.1' | 'USB 3.2' | 'Unknown';

export interface SpeedInfo {
	generation: UsbGeneration;
	maxTheoreticalMBps: number;
	typicalWriteMBps: number;
	estimatedTimeSeconds: (imageSizeBytes: number) => number;
}

const USB_SPEEDS: Record<UsbGeneration, { max: number; typical: number }> = {
	'USB 1.1': { max: 1.5, typical: 0.8 },
	'USB 2.0': { max: 60, typical: 25 },
	'USB 3.0': { max: 625, typical: 80 },
	'USB 3.1': { max: 1250, typical: 150 },
	'USB 3.2': { max: 2500, typical: 250 },
	'Unknown': { max: 60, typical: 25 },
};

/**
 * Estimate USB generation from bus type and description.
 * This is a heuristic — actual detection requires OS-specific APIs.
 */
export function detectUsbGeneration(busType?: string, description?: string): UsbGeneration {
	if (!busType && !description) return 'Unknown';

	const desc = (description || '').toLowerCase();
	const bus = (busType || '').toLowerCase();

	if (desc.includes('usb 3.2') || desc.includes('usb3.2')) return 'USB 3.2';
	if (desc.includes('usb 3.1') || desc.includes('usb3.1')) return 'USB 3.1';
	if (desc.includes('usb 3.0') || desc.includes('usb3.0') || desc.includes('usb 3')) return 'USB 3.0';
	if (desc.includes('usb 2.0') || desc.includes('usb2.0') || desc.includes('usb 2')) return 'USB 2.0';

	if (bus === 'usb') return 'USB 2.0'; // Conservative default for generic USB

	return 'Unknown';
}

/**
 * Get speed information for a USB generation.
 */
export function getSpeedInfo(generation: UsbGeneration): SpeedInfo {
	const speeds = USB_SPEEDS[generation];
	return {
		generation,
		maxTheoreticalMBps: speeds.max,
		typicalWriteMBps: speeds.typical,
		estimatedTimeSeconds: (imageSizeBytes: number) => {
			const sizeMB = imageSizeBytes / (1024 * 1024);
			return Math.ceil(sizeMB / speeds.typical);
		},
	};
}

/**
 * Format estimated time into a human-readable string.
 */
export function formatEstimatedTime(seconds: number): string {
	if (seconds < 60) return `~${seconds}s`;
	if (seconds < 3600) {
		const min = Math.floor(seconds / 60);
		const sec = seconds % 60;
		return sec > 0 ? `~${min}m ${sec}s` : `~${min}m`;
	}
	const hrs = Math.floor(seconds / 3600);
	const min = Math.floor((seconds % 3600) / 60);
	return `~${hrs}h ${min}m`;
}
