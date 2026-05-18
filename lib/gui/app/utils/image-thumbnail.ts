/**
 * Image thumbnail/icon selection based on detected OS or format.
 * Maps image filenames to appropriate icons in the UI.
 */

export type ImageOS = 'ubuntu' | 'fedora' | 'debian' | 'arch' | 'mint' | 'windows' | 'macos' | 'raspberrypi' | 'android' | 'generic';

const OS_PATTERNS: Array<{ pattern: RegExp; os: ImageOS }> = [
	{ pattern: /ubuntu|kubuntu|xubuntu|lubuntu|budgie/i, os: 'ubuntu' },
	{ pattern: /fedora/i, os: 'fedora' },
	{ pattern: /debian/i, os: 'debian' },
	{ pattern: /arch\s*linux|manjaro|endeavour/i, os: 'arch' },
	{ pattern: /mint/i, os: 'mint' },
	{ pattern: /windows|win1[01]|win7|win8/i, os: 'windows' },
	{ pattern: /macos|osx|hackintosh/i, os: 'macos' },
	{ pattern: /raspb|raspberry|rpi|raspi/i, os: 'raspberrypi' },
	{ pattern: /android|lineage|graphene/i, os: 'android' },
];

/**
 * Detect the operating system from an image filename.
 */
export function detectImageOS(filename: string): ImageOS {
	const lower = filename.toLowerCase();
	for (const { pattern, os } of OS_PATTERNS) {
		if (pattern.test(lower)) return os;
	}
	return 'generic';
}

/**
 * Get a color associated with the detected OS.
 */
export function getOSColor(os: ImageOS): string {
	const colors: Record<ImageOS, string> = {
		ubuntu: '#E95420',
		fedora: '#3C6EB4',
		debian: '#A81D33',
		arch: '#1793D1',
		mint: '#87CF3E',
		windows: '#0078D6',
		macos: '#999999',
		raspberrypi: '#C51A4A',
		android: '#3DDC84',
		generic: '#2297de',
	};
	return colors[os];
}

/**
 * Get a display label for the detected OS.
 */
export function getOSLabel(os: ImageOS): string {
	const labels: Record<ImageOS, string> = {
		ubuntu: 'Ubuntu',
		fedora: 'Fedora',
		debian: 'Debian',
		arch: 'Arch Linux',
		mint: 'Linux Mint',
		windows: 'Windows',
		macos: 'macOS',
		raspberrypi: 'Raspberry Pi OS',
		android: 'Android',
		generic: 'Disk Image',
	};
	return labels[os];
}
