/**
 * File validation utilities for Spark.
 * Pre-flash checks to catch common issues before starting a write operation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SUPPORTED_EXTENSIONS } from '../../../shared/supported-formats';

export interface ValidationResult {
	valid: boolean;
	warnings: string[];
	errors: string[];
}

/**
 * Validate an image file before flash.
 */
export function validateImageFile(imagePath: string): ValidationResult {
	const warnings: string[] = [];
	const errors: string[] = [];

	// Check file exists
	if (!fs.existsSync(imagePath)) {
		errors.push(`File not found: ${imagePath}`);
		return { valid: false, warnings, errors };
	}

	// Check file is readable
	try {
		fs.accessSync(imagePath, fs.constants.R_OK);
	} catch {
		errors.push('File is not readable. Check permissions.');
		return { valid: false, warnings, errors };
	}

	// Check file size
	const stat = fs.statSync(imagePath);
	if (stat.size === 0) {
		errors.push('File is empty (0 bytes).');
		return { valid: false, warnings, errors };
	}

	if (stat.size < 512) {
		warnings.push('File is very small (< 512 bytes). It may not be a valid disk image.');
	}

	// Check extension
	const ext = path.extname(imagePath).slice(1).toLowerCase();
	// Handle double extensions like .img.gz
	const basename = path.basename(imagePath);
	const parts = basename.split('.');
	const exts = parts.slice(1).map((e) => e.toLowerCase());

	const hasValidExt = exts.some((e) => SUPPORTED_EXTENSIONS.includes(e));
	if (!hasValidExt && ext) {
		warnings.push(`Uncommon file extension ".${ext}". Spark may not be able to process this file.`);
	}

	// Check if file is still being written (very recent modification)
	const mtime = stat.mtimeMs;
	const now = Date.now();
	if (now - mtime < 5000) {
		warnings.push('File was modified less than 5 seconds ago. It may still be downloading or extracting.');
	}

	return { valid: errors.length === 0, warnings, errors };
}

/**
 * Validate that a target drive has enough space for the image.
 */
export function validateDriveSize(
	imageSize: number,
	driveSize: number,
): ValidationResult {
	const warnings: string[] = [];
	const errors: string[] = [];

	if (driveSize < imageSize) {
		errors.push(
			`Image (${formatSize(imageSize)}) is larger than the drive (${formatSize(driveSize)}). ` +
			`The drive needs at least ${formatSize(imageSize - driveSize)} more space.`,
		);
	} else if (driveSize > imageSize * 10) {
		warnings.push(
			`Drive (${formatSize(driveSize)}) is much larger than the image (${formatSize(imageSize)}). ` +
			`Make sure this is the correct target drive.`,
		);
	}

	return { valid: errors.length === 0, warnings, errors };
}

function formatSize(bytes: number): string {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
