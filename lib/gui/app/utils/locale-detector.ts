/**
 * Enhanced locale detection with fallback chain.
 * Improves language matching beyond the basic Intl API detection.
 */

import * as os from 'os';

const SUPPORTED_LOCALES = ['en', 'zh-CN', 'zh-TW', 'ru', 'ja', 'ko', 'de', 'fr', 'es', 'it', 'pt', 'ar', 'tr', 'pl'];

/**
 * Detect the best matching locale for the current system.
 */
export function detectLocale(): string {
	// Try multiple detection methods in order of reliability
	const candidates = [
		getElectronLocale(),
		getIntlLocale(),
		getEnvLocale(),
		getOSLocale(),
	].filter(Boolean) as string[];

	for (const candidate of candidates) {
		const match = findBestMatch(candidate);
		if (match) return match;
	}

	return 'en';
}

/**
 * Try Electron's app.getLocale().
 */
function getElectronLocale(): string | null {
	try {
		const { app } = require('electron');
		return app.getLocale();
	} catch {
		return null;
	}
}

/**
 * Try Intl API.
 */
function getIntlLocale(): string | null {
	try {
		return Intl.DateTimeFormat().resolvedOptions().locale;
	} catch {
		return null;
	}
}

/**
 * Try environment variables.
 */
function getEnvLocale(): string | null {
	return process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || null;
}

/**
 * Try OS-level detection.
 */
function getOSLocale(): string | null {
	if (os.platform() === 'win32') {
		try {
			const { execSync } = require('child_process');
			const output = execSync('powershell -Command "(Get-Culture).Name"', { encoding: 'utf-8' });
			return output.trim();
		} catch {
			return null;
		}
	}
	return null;
}

/**
 * Find the best matching supported locale.
 */
function findBestMatch(locale: string): string | null {
	// Normalize: en-US -> en, zh-CN stays zh-CN
	const normalized = locale.replace(/_/g, '-');

	// Exact match
	if (SUPPORTED_LOCALES.includes(normalized)) return normalized;

	// Chinese variants
	if (normalized.startsWith('zh')) {
		if (normalized.includes('CN') || normalized.includes('SG') || normalized.includes('Hans')) {
			return 'zh-CN';
		}
		return 'zh-TW';
	}

	// Language-only match
	const lang = normalized.split('-')[0].toLowerCase();
	const langMatch = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === lang);
	if (langMatch) return langMatch;

	return null;
}

/**
 * Get all supported locale codes.
 */
export function getSupportedLocales(): string[] {
	return [...SUPPORTED_LOCALES];
}
