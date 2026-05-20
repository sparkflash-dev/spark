/**
 * Boot mode detection and configuration.
 * Detects system boot mode and recommends flash settings.
 */

import * as fs from 'fs';
import * as os from 'os';

export type SystemBootMode = 'uefi' | 'legacy' | 'unknown';

export function detectSystemBootMode(): SystemBootMode {
  if (os.platform() === 'linux') {
    try {
      if (fs.existsSync('/sys/firmware/efi')) {
        return 'uefi';
      }
      return 'legacy';
    } catch {
      return 'unknown';
    }
  }

  if (os.platform() === 'darwin') {
    return 'uefi'; // All Macs since 2006 use EFI
  }

  if (os.platform() === 'win32') {
    // Check for EFI system partition indicator
    try {
      const firmwarePath = 'C:\\Windows\\Panther\\setupact.log';
      if (fs.existsSync(firmwarePath)) {
        const content = fs.readFileSync(firmwarePath, 'utf-8');
        if (content.includes('Detected boot environment: EFI')) {
          return 'uefi';
        }
        if (content.includes('Detected boot environment: BIOS')) {
          return 'legacy';
        }
      }
    } catch {
      // ignore
    }
    return 'unknown';
  }

  return 'unknown';
}

export function isSecureBootEnabled(): boolean {
  if (os.platform() !== 'linux') return false;
  try {
    const sbState = fs.readFileSync('/sys/firmware/efi/efivars/SecureBoot-8be4df61-93ca-11d2-aa0d-00e098032b8c');
    return sbState[sbState.length - 1] === 1;
  } catch {
    return false;
  }
}

export function getBootModeDescription(mode: SystemBootMode): string {
  switch (mode) {
    case 'uefi': return 'UEFI — modern firmware, supports GPT and Secure Boot';
    case 'legacy': return 'Legacy BIOS — traditional firmware, requires MBR';
    case 'unknown': return 'Unknown — boot mode could not be detected';
  }
}
