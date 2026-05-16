/**
 * Content Security Policy configuration for Spark.
 * Restricts loaded resources to prevent XSS and data exfiltration.
 */

export interface CSPDirectives {
	'default-src': string[];
	'script-src': string[];
	'style-src': string[];
	'img-src': string[];
	'connect-src': string[];
	'font-src': string[];
	'object-src': string[];
	'frame-src': string[];
	'base-uri': string[];
}

/**
 * Production CSP policy — strict.
 */
export const PRODUCTION_CSP: CSPDirectives = {
	'default-src': ["'self'"],
	'script-src': ["'self'"],
	'style-src': ["'self'", "'unsafe-inline'"], // styled-components requires unsafe-inline
	'img-src': ["'self'", 'data:', 'blob:'],
	'connect-src': ["'self'", 'https://api.github.com'], // For update checks only
	'font-src': ["'self'"],
	'object-src': ["'none'"],
	'frame-src': ["'none'"],
	'base-uri': ["'self'"],
};

/**
 * Development CSP policy — relaxed for HMR and devtools.
 */
export const DEVELOPMENT_CSP: CSPDirectives = {
	'default-src': ["'self'"],
	'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
	'style-src': ["'self'", "'unsafe-inline'"],
	'img-src': ["'self'", 'data:', 'blob:', 'http://localhost:*'],
	'connect-src': ["'self'", 'ws://localhost:*', 'http://localhost:*', 'https://api.github.com'],
	'font-src': ["'self'", 'data:'],
	'object-src': ["'none'"],
	'frame-src': ["'none'"],
	'base-uri': ["'self'"],
};

/**
 * Serialize CSP directives to a policy string.
 */
export function serializeCSP(directives: CSPDirectives): string {
	return Object.entries(directives)
		.map(([key, values]) => `${key} ${values.join(' ')}`)
		.join('; ');
}

/**
 * Get the appropriate CSP policy based on environment.
 */
export function getCSPPolicy(): string {
	const isDev = process.env.NODE_ENV === 'development' || process.env.SPARK_DEV === '1';
	return serializeCSP(isDev ? DEVELOPMENT_CSP : PRODUCTION_CSP);
}
