/**
 * Desktop notification helper for Spark.
 * Provides cross-platform notifications for flash completion and errors.
 */

import * as settings from '../models/settings';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
	title: string;
	body: string;
	type: NotificationType;
	silent?: boolean;
}

/**
 * Show a desktop notification if enabled in settings.
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
	const enabled = settings.getSync('desktopNotifications');
	if (!enabled) return;

	try {
		const notification = new Notification(options.title, {
			body: options.body,
			icon: getIconForType(options.type),
			silent: options.silent ?? false,
		});

		// Auto-close after 8 seconds
		setTimeout(() => notification.close(), 8000);
	} catch (err) {
		console.warn('Failed to show notification:', err);
	}
}

/**
 * Notify flash completion.
 */
export function notifyFlashComplete(imageName: string, targetCount: number): void {
	showNotification({
		title: 'Flash Completed',
		body: `${imageName} written to ${targetCount} target${targetCount > 1 ? 's' : ''} successfully.`,
		type: 'success',
	});
}

/**
 * Notify flash failure.
 */
export function notifyFlashError(imageName: string, error: string): void {
	showNotification({
		title: 'Flash Failed',
		body: `Error writing ${imageName}: ${error}`,
		type: 'error',
	});
}

/**
 * Notify queue completion.
 */
export function notifyQueueComplete(total: number, failed: number): void {
	const status = failed > 0 ? `${total - failed} succeeded, ${failed} failed` : `All ${total} succeeded`;
	showNotification({
		title: 'Queue Completed',
		body: status,
		type: failed > 0 ? 'warning' : 'success',
	});
}

function getIconForType(_type: NotificationType): string | undefined {
	// Electron will use the app icon by default
	return undefined;
}
