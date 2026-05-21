/**
 * macOS SD card write fix — workaround for M-series chip corruption.
 * Forces unmount before write and uses raw device for better throughput.
 */

import * as os from 'os';

export interface MacOSDeviceInfo {
  diskDevice: string;  // /dev/disk4
  rawDevice: string;   // /dev/rdisk4
  isSDCard: boolean;
  needsWorkaround: boolean;
}

export function convertToRawDevice(device: string): string {
  // /dev/disk4 → /dev/rdisk4 (raw device for better performance)
  return device.replace(/\/dev\/disk/, '/dev/rdisk');
}

export function isAppleSiliconMac(): boolean {
  return os.platform() === 'darwin' && os.arch() === 'arm64';
}

export function needsSDCardWorkaround(busType: string): boolean {
  if (!isAppleSiliconMac()) return false;
  // SD cards via built-in reader on M-series need special handling
  return busType === 'SD' || busType === 'MMC';
}

export function getUnmountCommand(device: string): string {
  return `diskutil unmountDisk force ${device}`;
}

export function getEjectCommand(device: string): string {
  return `diskutil eject ${device}`;
}

export function getMacOSWriteFlags(): { flags: number; blockSize: number } {
  return {
    flags: 0x0002, // O_RDWR
    blockSize: 1024 * 1024, // 1 MB blocks for SD cards
  };
}

export function getSafeWriteConfig(): {
  maxRetries: number;
  retryDelay: number;
  verifyAfterWrite: boolean;
  useRawDevice: boolean;
  forceUnmount: boolean;
} {
  return {
    maxRetries: 3,
    retryDelay: 2000,
    verifyAfterWrite: true,
    useRawDevice: true,
    forceUnmount: true,
  };
}
