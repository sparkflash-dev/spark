/**
 * Clipboard utilities for Spark.
 * Handles copying flash results, error messages, and system info.
 */

import { clipboard } from 'electron';

/**
 * Copy text to system clipboard.
 */
export function copyToClipboard(text: string): void {
	clipboard.writeText(text);
}

/**
 * Read text from system clipboard.
 */
export function readFromClipboard(): string {
	return clipboard.readText();
}

/**
 * Copy flash error details for bug reporting.
 */
export function copyErrorReport(error: {
	code?: string;
	message: string;
	stack?: string;
	context?: Record<string, unknown>;
}): void {
	const lines = [
		'--- Spark Error Report ---',
		`Code: ${error.code || 'UNKNOWN'}`,
		`Message: ${error.message}`,
	];

	if (error.context) {
		lines.push('Context:');
		for (const [key, value] of Object.entries(error.context)) {
			lines.push(`  ${key}: ${JSON.stringify(value)}`);
		}
	}

	if (error.stack) {
		lines.push('', 'Stack trace:', error.stack);
	}

	copyToClipboard(lines.join('\n'));
}

/**
 * Copy flash results summary for sharing.
 */
export function copyFlashResult(result: {
	image: string;
	targets: number;
	duration: string;
	speed: string;
	verified: boolean;
}): void {
	const text = [
		`Flashed: ${result.image}`,
		`Targets: ${result.targets}`,
		`Duration: ${result.duration}`,
		`Speed: ${result.speed}`,
		`Verified: ${result.verified ? 'Yes' : 'No'}`,
	].join('\n');
	copyToClipboard(text);
}

/**
 * Check if clipboard contains a valid image URL.
 */
export function getClipboardUrl(): string | null {
	const text = readFromClipboard().trim();
	try {
		const url = new URL(text);
		if (url.protocol === 'http:' || url.protocol === 'https:') {
			// Check if it looks like an image URL
			const path = url.pathname.toLowerCase();
			if (path.match(/\.(iso|img|bin|raw|dmg|gz|xz|bz2|zip|zst)$/)) {
				return text;
			}
		}
	} catch {
		// Not a URL
	}
	return null;
}
