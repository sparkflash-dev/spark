/**
 * Color utility functions for dynamic UI theming.
 */

/**
 * Convert hex color to RGB components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
			}
		: null;
}

/**
 * Convert RGB to hex string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

/**
 * Darken a hex color by a percentage.
 */
export function darken(hex: string, amount: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;
	const factor = 1 - amount / 100;
	return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
}

/**
 * Lighten a hex color by a percentage.
 */
export function lighten(hex: string, amount: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;
	const factor = amount / 100;
	return rgbToHex(
		rgb.r + (255 - rgb.r) * factor,
		rgb.g + (255 - rgb.g) * factor,
		rgb.b + (255 - rgb.b) * factor,
	);
}

/**
 * Add alpha to a hex color (returns rgba string).
 */
export function withAlpha(hex: string, alpha: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Calculate relative luminance for contrast checking.
 */
export function luminance(hex: string): number {
	const rgb = hexToRgb(hex);
	if (!rgb) return 0;
	const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
		c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
	);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Get appropriate text color (black or white) for a given background.
 */
export function getContrastTextColor(bgHex: string): string {
	return luminance(bgHex) > 0.179 ? '#000000' : '#ffffff';
}
