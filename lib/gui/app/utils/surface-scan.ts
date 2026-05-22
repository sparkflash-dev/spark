/**
 * Surface scan — pre-write bad sector detection.
 * Reads entire drive surface and reports unreadable sectors.
 */

import { EventEmitter } from 'events';

export interface ScanResult {
  totalSectors: number;
  badSectors: number[];
  scannedSectors: number;
  duration: number;
  passed: boolean;
  speed: number; // sectors/sec
}

export interface ScanProgress {
  scannedSectors: number;
  totalSectors: number;
  percent: number;
  badCount: number;
  speed: number;
  eta: number;
}

export class SurfaceScanner extends EventEmitter {
  private cancelled = false;
  private sectorSize: number;

  constructor(sectorSize = 512) {
    super();
    this.sectorSize = sectorSize;
  }

  cancel(): void {
    this.cancelled = true;
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  getSectorSize(): number {
    return this.sectorSize;
  }

  calculateTotalSectors(driveSize: number): number {
    return Math.ceil(driveSize / this.sectorSize);
  }

  estimateScanDuration(driveSize: number, readSpeedBytesPerSec = 100 * 1024 * 1024): number {
    return Math.ceil(driveSize / readSpeedBytesPerSec) * 1000; // ms
  }

  formatScanResult(result: ScanResult): string {
    if (result.passed) {
      return `Surface scan passed — ${result.totalSectors} sectors OK, no bad sectors found`;
    }
    return `Surface scan found ${result.badSectors.length} bad sectors out of ${result.totalSectors}. Drive may be unreliable.`;
  }

  shouldRecommendScan(driveAge?: number, previousErrors?: number): boolean {
    if (previousErrors && previousErrors > 0) return true;
    if (driveAge && driveAge > 365 * 3) return true; // >3 years old
    return false;
  }
}

export function formatSectorAddress(sector: number): string {
  return `0x${sector.toString(16).toUpperCase().padStart(8, '0')}`;
}

export function getScanModes(): Array<{ name: string; description: string; speed: string }> {
  return [
    { name: 'Quick', description: 'Sample 1% of sectors randomly', speed: 'Fast (~30s for 32GB)' },
    { name: 'Standard', description: 'Sequential read of all sectors', speed: 'Normal (~5min for 32GB)' },
    { name: 'Thorough', description: 'Read + write pattern test (destructive)', speed: 'Slow (~15min for 32GB)' },
  ];
}
