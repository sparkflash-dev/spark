/**
 * Drive health analysis — provides warnings based on drive characteristics.
 * Since SMART data requires OS-specific privileged tools, this module uses
 * heuristic analysis based on available drive metadata from drivelist.
 */

export type HealthLevel = 'good' | 'caution' | 'warning';

export interface HealthIndicator {
	level: HealthLevel;
	message: string;
}

export interface DriveHealthReport {
	overall: HealthLevel;
	indicators: HealthIndicator[];
}

interface DriveInfo {
	size?: number;
	description?: string;
	busType?: string;
	isReadOnly?: boolean;
	isRemovable?: boolean;
	mountpoints?: Array<{ path: string }>;
}

const GB = 1024 * 1024 * 1024;
const TB = GB * 1024;

/**
 * Analyze a drive and return health indicators.
 * Uses heuristic checks since SMART requires privileged access.
 */
export function analyzeDriveHealth(drive: DriveInfo): DriveHealthReport {
	const indicators: HealthIndicator[] = [];

	// Check for unusually small USB drives (may be failing / fake)
	if (drive.size && drive.isRemovable) {
		if (drive.size < 100 * 1024 * 1024) {
			// < 100MB
			indicators.push({
				level: 'warning',
				message:
					'Drive is unusually small (< 100 MB). It may be a fake capacity drive or failing hardware.',
			});
		}
	}

	// Check for suspiciously round sizes (common in fake drives)
	if (drive.size && drive.isRemovable) {
		const sizeGB = drive.size / GB;
		// Fake drives often report exactly 32, 64, 128, etc.
		// Real drives are slightly less (e.g., 29.8 GB for a "32 GB" drive)
		const roundSizes = [8, 16, 32, 64, 128, 256, 512, 1024, 2048];
		for (const rs of roundSizes) {
			if (Math.abs(sizeGB - rs) < 0.01) {
				indicators.push({
					level: 'caution',
					message: `Drive reports exactly ${rs} GB — real drives are slightly smaller. Verify this is not a fake capacity drive.`,
				});
				break;
			}
		}
	}

	// Very large external drive warning
	if (drive.size && drive.size > 2 * TB && drive.isRemovable) {
		indicators.push({
			level: 'caution',
			message:
				'This is a very large removable drive (> 2 TB). Please ensure it does not contain important data.',
		});
	}

	// Read-only drive
	if (drive.isReadOnly) {
		indicators.push({
			level: 'warning',
			message:
				'Drive is read-only. Check the physical write-protect switch if present.',
		});
	}

	// Bus type warnings
	if (drive.busType) {
		const bus = drive.busType.toUpperCase();
		if (bus === 'USB' || bus === 'UNKNOWN') {
			// Standard, no warning
		} else if (bus === 'SCSI' || bus === 'SATA' || bus === 'ATA') {
			indicators.push({
				level: 'caution',
				message: `Drive is connected via ${bus}. This might be an internal drive — double-check before flashing.`,
			});
		}
	}

	// Active mountpoints
	if (drive.mountpoints && drive.mountpoints.length > 0) {
		const mounts = drive.mountpoints.map((m) => m.path).join(', ');
		indicators.push({
			level: 'caution',
			message: `Drive has active mount points: ${mounts}. These will be unmounted before flashing.`,
		});
	}

	// Calculate overall health
	let overall: HealthLevel = 'good';
	if (indicators.some((i) => i.level === 'warning')) {
		overall = 'warning';
	} else if (indicators.some((i) => i.level === 'caution')) {
		overall = 'caution';
	}

	return { overall, indicators };
}

/**
 * Get a color for the health level indicator.
 */
export function getHealthColor(level: HealthLevel): string {
	switch (level) {
		case 'good':
			return '#22c55e'; // green
		case 'caution':
			return '#f59e0b'; // amber
		case 'warning':
			return '#ef4444'; // red
	}
}

/**
 * Get an icon name for the health level.
 */
export function getHealthIcon(level: HealthLevel): string {
	switch (level) {
		case 'good':
			return 'check-circle';
		case 'caution':
			return 'alert-triangle';
		case 'warning':
			return 'x-circle';
	}
}

/**
 * Check if a drive's reported size matches common fake capacity patterns.
 * Fake drives often use exact powers of 2 in their firmware.
 */
export function isSuspiciousCapacity(sizeBytes: number): boolean {
	if (sizeBytes <= 0) return false;
	const sizeGB = sizeBytes / (1024 * 1024 * 1024);
	// Exact power-of-2 GB values are suspicious for removable drives
	const log2 = Math.log2(sizeGB);
	return Math.abs(log2 - Math.round(log2)) < 0.001 && sizeGB >= 8;
}
