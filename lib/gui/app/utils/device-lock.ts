/**
 * Device lock manager.
 * Prevents concurrent write operations to the same device.
 */

const locks = new Map<string, { lockedAt: number; operation: string }>();

export interface LockResult {
	acquired: boolean;
	device: string;
	error?: string;
}

/**
 * Acquire an exclusive lock on a device.
 */
export function acquireLock(device: string, operation: string = 'flash'): LockResult {
	const normalized = normalizeDevice(device);
	const existing = locks.get(normalized);

	if (existing) {
		const elapsed = Math.round((Date.now() - existing.lockedAt) / 1000);
		return {
			acquired: false,
			device: normalized,
			error: `Device is locked by "${existing.operation}" (${elapsed}s ago)`,
		};
	}

	locks.set(normalized, { lockedAt: Date.now(), operation });
	return { acquired: true, device: normalized };
}

/**
 * Release a device lock.
 */
export function releaseLock(device: string): boolean {
	return locks.delete(normalizeDevice(device));
}

/**
 * Check if a device is locked.
 */
export function isLocked(device: string): boolean {
	return locks.has(normalizeDevice(device));
}

/**
 * Release all locks (cleanup on exit).
 */
export function releaseAll(): void {
	locks.clear();
}

/**
 * Get all currently locked devices.
 */
export function getLockedDevices(): string[] {
	return Array.from(locks.keys());
}

/**
 * Normalize device path for consistent comparison.
 */
function normalizeDevice(device: string): string {
	return device.replace(/\\/g, '/').toLowerCase();
}
