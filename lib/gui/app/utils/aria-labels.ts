/**
 * ARIA labels and screen reader support.
 * Centralized accessibility text for all UI components.
 */

export interface AriaConfig {
  role: string;
  label: string;
  description?: string;
  live?: 'polite' | 'assertive' | 'off';
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

export const ARIA_LABELS = {
  // Main sections
  imageSelector: {
    role: 'button',
    label: 'Select image file',
    description: 'Click to choose an OS image file to flash, or drag and drop a file here',
  },
  driveSelector: {
    role: 'button',
    label: 'Select target drive',
    description: 'Click to choose which USB drive or SD card to flash',
  },
  flashButton: {
    role: 'button',
    label: 'Flash image to drive',
    description: 'Start writing the selected image to the selected drive',
  },

  // Progress
  progressBar: {
    role: 'progressbar',
    label: 'Flash progress',
    live: 'polite' as const,
  },
  progressPercent: {
    role: 'status',
    label: 'Completion percentage',
    live: 'polite' as const,
  },
  progressSpeed: {
    role: 'status',
    label: 'Write speed',
    live: 'polite' as const,
  },
  progressEta: {
    role: 'timer',
    label: 'Estimated time remaining',
    live: 'polite' as const,
  },

  // Drive list
  driveList: {
    role: 'listbox',
    label: 'Available drives',
    description: 'List of detected USB drives and SD cards',
  },
  driveItem: {
    role: 'option',
    label: 'Drive',
  },

  // Settings
  settingsPanel: {
    role: 'dialog',
    label: 'Settings',
    description: 'Application settings and preferences',
  },
  verifyToggle: {
    role: 'switch',
    label: 'Verify write after flashing',
  },
  autoSelectToggle: {
    role: 'switch',
    label: 'Auto-select single drive',
  },
} as const;

export function getProgressAnnouncement(percent: number, speed: string, eta: string): string {
  if (percent === 100) return 'Flash complete. Verifying...';
  if (percent === 0) return 'Starting flash...';
  return `${percent}% complete. Speed: ${speed}. Time remaining: ${eta}`;
}

export function getDriveAnnouncement(name: string, size: string, type: string): string {
  return `${name}, ${size}, ${type}`;
}

export function getErrorAnnouncement(message: string): string {
  return `Error: ${message}`;
}

export function getSuccessAnnouncement(duration: string): string {
  return `Flash completed successfully in ${duration}`;
}
