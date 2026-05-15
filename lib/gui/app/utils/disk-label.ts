/**
 * Disk label formatting utilities.
 * Provides human-friendly display names for drives based on metadata.
 */

interface DriveInfo {
	description?: string;
	device?: string;
	mountpoints?: Array<{ path: string; label?: string }>;
	size?: number;
	busType?: string;
	isVirtual?: boolean;
}

/**
 * Generate a human-friendly label for a drive.
 */
export function formatDriveLabel(drive: DriveInfo): string {
	// Prefer mountpoint label
	if (drive.mountpoints?.length) {
		const labeled = drive.mountpoints.find((m) => m.label);
		if (labeled?.label) return labeled.label;
	}

	// Use description if available
	if (drive.description) {
		return cleanDescription(drive.description);
	}

	// Fallback to device path
	return drive.device || 'Unknown Drive';
}

/**
 * Clean up manufacturer descriptions.
 */
function cleanDescription(desc: string): string {
	// Remove redundant vendor prefixes
	return desc
		.replace(/\s*(USB|SCSI|ATA)\s*$/i, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Format drive size for display.
 */
export function formatDriveSize(bytes: number): string {
	if (bytes <= 0) return 'Unknown size';
	const gb = bytes / (1024 * 1024 * 1024);
	if (gb >= 1000) return `${(gb / 1024).toFixed(1)} TB`;
	if (gb >= 1) return `${gb.toFixed(1)} GB`;
	const mb = bytes / (1024 * 1024);
	return `${mb.toFixed(0)} MB`;
}

/**
 * Get drive type description from bus type.
 */
export function getDriveTypeLabel(busType?: string, isVirtual?: boolean): string {
	if (isVirtual) return 'Virtual';
	if (!busType) return 'Unknown';

	const types: Record<string, string> = {
		USB: 'USB Drive',
		SCSI: 'External Drive',
		ATA: 'Internal Drive',
		SATA: 'Internal Drive',
		NVMe: 'NVMe Drive',
		SD: 'SD Card',
		MMC: 'SD Card',
	};

	return types[busType.toUpperCase()] || busType;
}

/**
 * Get a short identifier for logging.
 */
export function getDriveShortId(device: string): string {
	// /dev/sda -> sda, \\.\PhysicalDrive0 -> PhysicalDrive0
	const parts = device.split(/[/\\]/);
	return parts[parts.length - 1] || device;
}
