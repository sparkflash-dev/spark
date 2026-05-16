/**
 * Environment configuration for Spark.
 * Reads configuration from environment variables with sensible defaults.
 */

export interface EnvConfig {
	isDev: boolean;
	isTest: boolean;
	isProd: boolean;
	logLevel: string;
	disableGpu: boolean;
	sidecarPort: number;
	updateCheckEnabled: boolean;
	analyticsEnabled: boolean; // Always false — zero telemetry
}

/**
 * Read environment configuration.
 */
export function getEnvConfig(): EnvConfig {
	const nodeEnv = process.env.NODE_ENV || 'production';
	return {
		isDev: nodeEnv === 'development' || process.env.SPARK_DEV === '1',
		isTest: nodeEnv === 'test' || process.env.SPARK_TEST === '1',
		isProd: nodeEnv === 'production' && !process.env.SPARK_DEV,
		logLevel: process.env.SPARK_LOG_LEVEL || (nodeEnv === 'development' ? 'debug' : 'info'),
		disableGpu: process.env.SPARK_DISABLE_GPU === '1',
		sidecarPort: parseInt(process.env.SPARK_SIDECAR_PORT || '3434', 10),
		updateCheckEnabled: process.env.SPARK_NO_UPDATE_CHECK !== '1',
		analyticsEnabled: false, // Always false — zero telemetry policy
	};
}

/**
 * Get the sidecar WebSocket URL.
 */
export function getSidecarUrl(): string {
	const config = getEnvConfig();
	return `ws://127.0.0.1:${config.sidecarPort}`;
}

/**
 * Check if running in development mode.
 */
export function isDevelopment(): boolean {
	return getEnvConfig().isDev;
}

/**
 * Check if running in test mode.
 */
export function isTest(): boolean {
	return getEnvConfig().isTest;
}
