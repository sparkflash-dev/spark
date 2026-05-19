/**
 * Drive-image compatibility checker.
 * Validates that a target drive is suitable for the selected image.
 */

export interface CompatibilityResult {
	compatible: boolean;
	warnings: string[];
	errors: string[];
}

interface ImageInfo {
	size: number;
	isCompressed: boolean;
	estimatedUncompressedSize?: number;
	partitionScheme?: 'mbr' | 'gpt';
}

interface DriveInfo {
	size: number;
	isReadOnly: boolean;
	isSystem: boolean;
	busType: string;
	isRemovable: boolean;
}

/**
 * Check if a drive is compatible with an image.
 */
export function checkCompatibility(image: ImageInfo, drive: DriveInfo): CompatibilityResult {
	const warnings: string[] = [];
	const errors: string[] = [];

	// Read-only drives can't be written to
	if (drive.isReadOnly) {
		errors.push('Drive is read-only. Check for a physical write-protect switch.');
	}

	// Size check
	const requiredSize = image.isCompressed
		? (image.estimatedUncompressedSize || image.size * 3) // Rough estimate for compressed
		: image.size;

	if (drive.size < requiredSize) {
		errors.push(
			`Drive (${formatGB(drive.size)}) is too small for image (${formatGB(requiredSize)}).`,
		);
	} else if (drive.size < requiredSize * 1.05) {
		warnings.push('Drive is barely large enough. Some filesystem overhead may cause issues.');
	}

	// System drive warning
	if (drive.isSystem) {
		warnings.push('This appears to be a system drive. Proceed with extreme caution.');
	}

	// Non-removable drive warning
	if (!drive.isRemovable) {
		warnings.push('Drive is not marked as removable. Verify this is the correct target.');
	}

	// GPT image on small drive
	if (image.partitionScheme === 'gpt' && drive.size < 2 * 1024 * 1024 * 1024) {
		warnings.push('GPT partitioned image on a very small drive may cause boot issues.');
	}

	return {
		compatible: errors.length === 0,
		warnings,
		errors,
	};
}

function formatGB(bytes: number): string {
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
