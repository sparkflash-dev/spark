/**
 * Native notification manager — OS-level notifications for flash events.
 * Supports sound, urgency, and action buttons.
 */

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  sound?: boolean;
  urgency?: 'low' | 'normal' | 'critical';
  actions?: Array<{ label: string; action: string }>;
  timeout?: number;
}

export function createFlashCompleteNotification(
  imageName: string,
  driveName: string,
  duration: string,
  success: boolean,
): NotificationConfig {
  if (success) {
    return {
      title: 'Flash Complete',
      body: `${imageName} → ${driveName}\nCompleted in ${duration}`,
      sound: true,
      urgency: 'normal',
      actions: [
        { label: 'Eject Drive', action: 'eject' },
        { label: 'Flash Another', action: 'flash-another' },
      ],
    };
  }
  return {
    title: 'Flash Failed',
    body: `Failed to write ${imageName} to ${driveName}`,
    sound: true,
    urgency: 'critical',
    actions: [
      { label: 'Retry', action: 'retry' },
      { label: 'View Log', action: 'view-log' },
    ],
  };
}

export function createDriveDetectedNotification(driveName: string, driveSize: string): NotificationConfig {
  return {
    title: 'Drive Detected',
    body: `${driveName} (${driveSize}) is ready`,
    urgency: 'low',
    timeout: 5000,
  };
}

export function createVerificationNotification(passed: boolean): NotificationConfig {
  return {
    title: passed ? 'Verification Passed' : 'Verification Failed',
    body: passed
      ? 'The written data matches the source image'
      : 'Data mismatch detected — the flash may be corrupted',
    urgency: passed ? 'low' : 'critical',
    sound: !passed,
  };
}

export function createQueueNotification(completed: number, total: number): NotificationConfig {
  return {
    title: `Queue Progress: ${completed}/${total}`,
    body: completed === total
      ? 'All drives have been flashed successfully'
      : `${completed} of ${total} drives complete. Insert next drive.`,
    urgency: completed === total ? 'normal' : 'low',
    sound: completed === total,
  };
}
