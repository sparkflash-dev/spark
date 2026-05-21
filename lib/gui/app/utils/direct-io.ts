/**
 * Direct I/O configuration for faster writes.
 * Bypasses OS buffer cache when supported for better throughput.
 */

import * as os from 'os';

export interface IOConfig {
  useDirectIO: boolean;
  bufferSize: number;
  readAhead: number;
  writeThrough: boolean;
}

export function getOptimalIOConfig(driveSize: number): IOConfig {
  const totalMem = os.totalmem();
  const platform = os.platform();

  // Larger buffer for bigger drives
  let bufferSize: number;
  if (driveSize > 64 * 1024 * 1024 * 1024) {
    bufferSize = 16 * 1024 * 1024; // 16 MB for >64 GB
  } else if (driveSize > 8 * 1024 * 1024 * 1024) {
    bufferSize = 8 * 1024 * 1024; // 8 MB for >8 GB
  } else {
    bufferSize = 4 * 1024 * 1024; // 4 MB default
  }

  // Don't use more than 1% of total memory per buffer
  const maxBuffer = Math.floor(totalMem * 0.01);
  bufferSize = Math.min(bufferSize, maxBuffer);

  return {
    useDirectIO: platform === 'linux', // O_DIRECT only reliable on Linux
    bufferSize,
    readAhead: bufferSize * 2,
    writeThrough: platform === 'win32', // FILE_FLAG_WRITE_THROUGH on Windows
  };
}

export function getLinuxIOFlags(): number {
  // O_DIRECT = 0x4000 on most Linux architectures
  return 0x4000;
}

export function alignBuffer(size: number, alignment = 4096): number {
  return Math.ceil(size / alignment) * alignment;
}

export function estimateOptimalConcurrency(): number {
  const cpus = os.cpus().length;
  return Math.min(Math.max(cpus, 2), 8);
}

export function getIOSchedulerHint(platform: string): string {
  switch (platform) {
    case 'linux':
      return 'For best USB write performance, use: echo none > /sys/block/sdX/queue/scheduler';
    case 'darwin':
      return 'macOS manages I/O scheduling automatically';
    case 'win32':
      return 'For best performance, disable Windows write caching verification in Device Manager';
    default:
      return '';
  }
}
