/**
 * Burn profiles — predefined configuration presets for common use cases.
 * Allows users to quickly select optimized settings for their target scenario.
 */

export interface BurnProfile {
	id: string;
	name: string;
	description: string;
	settings: {
		verify: boolean;
		decompress: boolean;
		trim: boolean;
		badSectorCheck: boolean;
		autoEject: boolean;
		bufferSize?: number;
	};
}

export const PROFILES: BurnProfile[] = [
	{
		id: 'fast',
		name: 'Fast',
		description: 'Maximum speed, skip verification. For trusted images and quick testing.',
		settings: {
			verify: false,
			decompress: false,
			trim: false,
			badSectorCheck: false,
			autoEject: true,
		},
	},
	{
		id: 'balanced',
		name: 'Balanced',
		description: 'Good speed with verification. Recommended for most use cases.',
		settings: {
			verify: true,
			decompress: false,
			trim: true,
			badSectorCheck: false,
			autoEject: true,
		},
	},
	{
		id: 'safe',
		name: 'Safe',
		description: 'Full verification and bad sector check. For critical deployments.',
		settings: {
			verify: true,
			decompress: true,
			trim: true,
			badSectorCheck: true,
			autoEject: false,
		},
	},
	{
		id: 'batch',
		name: 'Batch',
		description: 'Optimized for flashing many drives sequentially. Auto-eject enabled.',
		settings: {
			verify: true,
			decompress: false,
			trim: false,
			badSectorCheck: false,
			autoEject: true,
		},
	},
];

/**
 * Get a profile by ID.
 */
export function getProfile(id: string): BurnProfile | undefined {
	return PROFILES.find((p) => p.id === id);
}

/**
 * Get the default profile.
 */
export function getDefaultProfile(): BurnProfile {
	return PROFILES.find((p) => p.id === 'balanced')!;
}

/**
 * Get all available profile IDs.
 */
export function getProfileIds(): string[] {
	return PROFILES.map((p) => p.id);
}
