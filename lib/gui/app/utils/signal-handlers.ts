/**
 * Signal handlers for graceful shutdown.
 * Ensures drives are safely unmounted and locks released on exit.
 */

import { releaseAll as releaseAllLocks } from './device-lock';
import { allowSleep } from './power-save';

type CleanupFn = () => void | Promise<void>;

const cleanupFns: CleanupFn[] = [];
let registered = false;

/**
 * Register a cleanup function to run on exit.
 */
export function onExit(fn: CleanupFn): void {
	cleanupFns.push(fn);
	ensureHandlersRegistered();
}

/**
 * Register built-in cleanup handlers.
 */
function ensureHandlersRegistered(): void {
	if (registered) return;
	registered = true;

	const cleanup = async () => {
		// Release device locks
		releaseAllLocks();

		// Allow system sleep
		try { allowSleep(); } catch {}

		// Run custom cleanup functions
		for (const fn of cleanupFns) {
			try {
				await fn();
			} catch (err) {
				console.error('Cleanup error:', err);
			}
		}
	};

	// Handle various exit signals
	process.on('SIGINT', async () => {
		await cleanup();
		process.exit(130);
	});

	process.on('SIGTERM', async () => {
		await cleanup();
		process.exit(143);
	});

	process.on('exit', () => {
		// Synchronous cleanup only
		releaseAllLocks();
	});

	// Handle uncaught errors gracefully
	process.on('uncaughtException', async (err) => {
		console.error('Uncaught exception:', err);
		await cleanup();
		process.exit(1);
	});
}

/**
 * Get the number of registered cleanup functions.
 */
export function getCleanupCount(): number {
	return cleanupFns.length;
}
