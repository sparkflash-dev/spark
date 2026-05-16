/**
 * Power save blocker for flash operations.
 * Prevents the system from sleeping during active writes.
 */

import { powerSaveBlocker } from 'electron';

let blockerId: number | null = null;

/**
 * Prevent system sleep during flash operation.
 * Returns a blocker ID that can be used to release.
 */
export function preventSleep(): number {
	if (blockerId !== null) {
		return blockerId;
	}
	blockerId = powerSaveBlocker.start('prevent-app-suspension');
	return blockerId;
}

/**
 * Allow system to sleep again.
 */
export function allowSleep(): void {
	if (blockerId !== null) {
		powerSaveBlocker.stop(blockerId);
		blockerId = null;
	}
}

/**
 * Check if sleep prevention is active.
 */
export function isSleepPrevented(): boolean {
	if (blockerId === null) return false;
	return powerSaveBlocker.isStarted(blockerId);
}
