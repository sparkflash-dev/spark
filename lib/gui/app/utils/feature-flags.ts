/**
 * Feature flags for Spark.
 * Enables gradual rollout and testing of new features.
 * All flags default to stable values — experimental features must be explicitly enabled.
 */

export interface FeatureFlags {
	multiWrite: boolean;
	autoUpdate: boolean;
	deepLinks: boolean;
	burnProfiles: boolean;
	flashQueue: boolean;
	isoParser: boolean;
	sessionStats: boolean;
	networkDownload: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
	multiWrite: true,
	autoUpdate: true,
	deepLinks: true,
	burnProfiles: true,
	flashQueue: true,
	isoParser: true,
	sessionStats: true,
	networkDownload: true,
};

let overrides: Partial<FeatureFlags> = {};

/**
 * Check if a feature is enabled.
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
	if (flag in overrides) return overrides[flag]!;
	return DEFAULT_FLAGS[flag];
}

/**
 * Override a feature flag (for testing or config).
 */
export function setFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): void {
	overrides[flag] = enabled;
}

/**
 * Reset all overrides to defaults.
 */
export function resetFlags(): void {
	overrides = {};
}

/**
 * Get all current flag values.
 */
export function getAllFlags(): FeatureFlags {
	return { ...DEFAULT_FLAGS, ...overrides };
}

/**
 * Load feature flags from environment variables.
 * Format: SPARK_FLAG_MULTI_WRITE=1
 */
export function loadFlagsFromEnv(): void {
	const mapping: Record<string, keyof FeatureFlags> = {
		SPARK_FLAG_MULTI_WRITE: 'multiWrite',
		SPARK_FLAG_AUTO_UPDATE: 'autoUpdate',
		SPARK_FLAG_DEEP_LINKS: 'deepLinks',
		SPARK_FLAG_BURN_PROFILES: 'burnProfiles',
		SPARK_FLAG_FLASH_QUEUE: 'flashQueue',
		SPARK_FLAG_ISO_PARSER: 'isoParser',
		SPARK_FLAG_SESSION_STATS: 'sessionStats',
		SPARK_FLAG_NETWORK_DOWNLOAD: 'networkDownload',
	};

	for (const [envVar, flag] of Object.entries(mapping)) {
		const value = process.env[envVar];
		if (value === '1' || value === 'true') setFeatureFlag(flag, true);
		if (value === '0' || value === 'false') setFeatureFlag(flag, false);
	}
}
