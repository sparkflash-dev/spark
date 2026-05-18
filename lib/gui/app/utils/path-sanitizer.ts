/**
 * Path sanitization utilities.
 * Prevents path traversal attacks and validates file paths.
 */

import * as path from 'path';

/**
 * Sanitize a file path to prevent directory traversal.
 */
export function sanitizePath(input: string): string {
	// Remove null bytes
	let clean = input.replace(/\0/g, '');
	// Resolve to absolute path and normalize
	clean = path.resolve(clean);
	return clean;
}

/**
 * Check if a path is contained within an allowed directory.
 */
export function isWithinDirectory(filePath: string, allowedDir: string): boolean {
	const resolvedPath = path.resolve(filePath);
	const resolvedDir = path.resolve(allowedDir) + path.sep;
	return resolvedPath.startsWith(resolvedDir) || resolvedPath === path.resolve(allowedDir);
}

/**
 * Validate that a path doesn't contain suspicious patterns.
 */
export function isPathSafe(filePath: string): boolean {
	const suspicious = ['..', '~', '\0', '|', ';', '&', '$', '`'];
	return !suspicious.some((s) => filePath.includes(s));
}

/**
 * Get a safe display name for a file path (basename only).
 */
export function getSafeDisplayName(filePath: string): string {
	return path.basename(sanitizePath(filePath));
}

/**
 * Validate an image path before use.
 */
export function validateImagePath(imagePath: string): { valid: boolean; error?: string } {
	if (!imagePath || imagePath.trim().length === 0) {
		return { valid: false, error: 'Path is empty' };
	}

	if (imagePath.includes('\0')) {
		return { valid: false, error: 'Path contains null bytes' };
	}

	if (imagePath.includes('..')) {
		return { valid: false, error: 'Path contains directory traversal' };
	}

	return { valid: true };
}
