/**
 * Deep link handler for spark:// protocol.
 * Allows opening Spark with a pre-selected image from external apps.
 *
 * Supported URLs:
 *   spark://flash?image=/path/to/file.iso
 *   spark://flash?url=https://example.com/image.iso
 */

export interface DeepLinkAction {
	action: 'flash' | 'unknown';
	imagePath?: string;
	imageUrl?: string;
	error?: string;
}

/**
 * Parse a spark:// deep link URL.
 */
export function parseDeepLink(url: string): DeepLinkAction {
	try {
		// Normalize spark:// to a parseable format
		const normalized = url.replace(/^spark:\/\//, 'https://spark/');
		const parsed = new URL(normalized);
		const pathname = parsed.pathname.replace(/^\//, '');

		if (pathname === 'flash') {
			const imagePath = parsed.searchParams.get('image');
			const imageUrl = parsed.searchParams.get('url');

			if (!imagePath && !imageUrl) {
				return { action: 'flash', error: 'No image path or URL provided' };
			}

			if (imageUrl) {
				// Validate URL
				const urlObj = new URL(imageUrl);
				if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
					return { action: 'flash', error: 'Only HTTP/HTTPS URLs are supported' };
				}
			}

			return {
				action: 'flash',
				imagePath: imagePath || undefined,
				imageUrl: imageUrl || undefined,
			};
		}

		return { action: 'unknown', error: `Unknown action: ${pathname}` };
	} catch (err: any) {
		return { action: 'unknown', error: err.message };
	}
}

/**
 * Check if a string is a valid spark:// deep link.
 */
export function isDeepLink(url: string): boolean {
	return url.startsWith('spark://');
}

/**
 * Build a spark:// URL for a local file.
 */
export function buildDeepLink(imagePath: string): string {
	return `spark://flash?image=${encodeURIComponent(imagePath)}`;
}
