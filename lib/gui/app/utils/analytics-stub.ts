/**
 * Analytics stub for Spark.
 * This module provides a no-op analytics interface to ensure
 * zero telemetry is ever sent. All tracking calls are intentionally
 * discarded. This exists to prevent any accidental re-introduction
 * of telemetry from upstream etcher-sdk or dependencies.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

export interface AnalyticsEvent {
	name: string;
	properties?: Record<string, unknown>;
}

/**
 * Track an event — intentionally does nothing.
 * Spark has a strict zero-telemetry policy.
 */
export function track(_event: string, _properties?: Record<string, unknown>): void {
	// Intentionally empty — zero telemetry
}

/**
 * Identify a user — intentionally does nothing.
 */
export function identify(_userId: string, _traits?: Record<string, unknown>): void {
	// Intentionally empty — zero telemetry
}

/**
 * Initialize analytics — intentionally does nothing.
 */
export function initialize(_writeKey?: string): void {
	// Intentionally empty — zero telemetry
}

/**
 * Flush analytics queue — intentionally does nothing.
 */
export function flush(): Promise<void> {
	return Promise.resolve();
}

/**
 * Check if analytics is enabled — always returns false.
 */
export function isEnabled(): boolean {
	return false;
}
