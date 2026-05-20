/**
 * macOS code signing and notarization helpers.
 * Detects signing issues and provides user guidance.
 */

import * as os from 'os';

export interface SigningStatus {
  isSigned: boolean;
  isNotarized: boolean;
  identity?: string;
  issues: string[];
}

export function isMacOS(): boolean {
  return os.platform() === 'darwin';
}

export function getMacOSVersion(): string | null {
  if (!isMacOS()) return null;
  const release = os.release();
  const [major] = release.split('.').map(Number);
  // Darwin 23 = macOS 14 Sonoma, 24 = macOS 15 Sequoia
  const macVersion = major - 9;
  return `macOS ${macVersion}`;
}

export function isAppleSilicon(): boolean {
  if (!isMacOS()) return false;
  return os.arch() === 'arm64';
}

export function getGatekeeperBypassInstructions(): string[] {
  return [
    'If macOS shows "will damage your computer":',
    '1. Open System Settings → Privacy & Security',
    '2. Scroll down to find the blocked app message',
    '3. Click "Open Anyway"',
    '',
    'Alternatively, run in Terminal:',
    'xattr -cr /Applications/Spark.app',
    '',
    'This is needed because Spark is not yet notarized with Apple.',
  ];
}

export function getAppleSiliconNotes(): string[] {
  if (!isAppleSilicon()) return [];
  return [
    'Running on Apple Silicon (M-series chip)',
    'SD card operations may require Rosetta for some adapters',
    'If SD cards are not detected, try: softwareupdate --install-rosetta',
  ];
}
