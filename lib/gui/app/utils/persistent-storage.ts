/**
 * Persistent storage support for Linux live USB drives.
 *
 * Some Linux distributions (Ubuntu, Linux Mint, etc.) support persistent storage
 * via a casper-rw or writable partition/file. This module detects eligible ISOs
 * and provides helpers for creating persistence.
 */

import * as path from 'path';

export interface PersistenceConfig {
	supported: boolean;
	method: 'casper-rw' | 'writable' | null;
	distro?: string;
	/** Suggested persistence sizes in MB */
	suggestedSizes: number[];
}

const LIVE_ISO_PATTERNS: Array<{
	pattern: RegExp;
	distro: string;
	method: 'casper-rw' | 'writable';
}> = [
	{
		pattern: /ubuntu/i,
		distro: 'Ubuntu',
		method: 'casper-rw',
	},
	{
		pattern: /kubuntu/i,
		distro: 'Kubuntu',
		method: 'casper-rw',
	},
	{
		pattern: /xubuntu/i,
		distro: 'Xubuntu',
		method: 'casper-rw',
	},
	{
		pattern: /lubuntu/i,
		distro: 'Lubuntu',
		method: 'casper-rw',
	},
	{
		pattern: /linux\s*mint/i,
		distro: 'Linux Mint',
		method: 'casper-rw',
	},
	{
		pattern: /elementary/i,
		distro: 'elementary OS',
		method: 'casper-rw',
	},
	{
		pattern: /pop[\s_-]*os/i,
		distro: 'Pop!_OS',
		method: 'casper-rw',
	},
	{
		pattern: /zorin/i,
		distro: 'Zorin OS',
		method: 'casper-rw',
	},
];

const DEFAULT_SUGGESTED_SIZES = [512, 1024, 2048, 4096]; // MB

/**
 * Detect if an image supports persistent storage.
 * Based on filename pattern matching against known live ISO distributions.
 */
export function detectPersistenceSupport(imagePath: string): PersistenceConfig {
	const basename = path.basename(imagePath).toLowerCase();

	for (const { pattern, distro, method } of LIVE_ISO_PATTERNS) {
		if (pattern.test(basename)) {
			return {
				supported: true,
				method,
				distro,
				suggestedSizes: DEFAULT_SUGGESTED_SIZES,
			};
		}
	}

	return {
		supported: false,
		method: null,
		suggestedSizes: [],
	};
}

/**
 * Check if the image is a live Linux ISO (any distro).
 */
export function isLiveLinuxISO(imagePath: string): boolean {
	const basename = path.basename(imagePath).toLowerCase();
	// Check for common live ISO indicators
	if (!/\.iso$/i.test(basename)) return false;
	return LIVE_ISO_PATTERNS.some(({ pattern }) => pattern.test(basename));
}

/**
 * Get the persistence filename for the detected method.
 */
export function getPersistenceFilename(method: 'casper-rw' | 'writable'): string {
	return method === 'casper-rw' ? 'casper-rw' : 'writable';
}

/**
 * Get a human-readable description of persistence support for the detected distro.
 */
export function getPersistenceDescription(config: PersistenceConfig): string {
	if (!config.supported || !config.distro || !config.method) {
		return '';
	}
	const filename = getPersistenceFilename(config.method);
	return `${config.distro} supports persistent storage via a "${filename}" partition. ` +
		`Changes made in the live session will be saved across reboots.`;
}
