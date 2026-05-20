/**
 * Drive backup/clone — read drive to .img file or clone drive-to-drive.
 * Supports raw and compressed output formats.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';

export interface BackupOptions {
  sourceDrive: string;
  outputPath: string;
  compress?: 'none' | 'gzip' | 'zstd';
  includeChecksum?: boolean;
  blockSize?: number;
}

export interface BackupProgress {
  bytesRead: number;
  totalBytes: number;
  percent: number;
  speed: number; // bytes/sec
  elapsed: number; // ms
  eta: number; // ms
}

export interface BackupResult {
  outputPath: string;
  bytesRead: number;
  duration: number;
  checksum?: string;
  compressed: boolean;
}

export class DriveBackup extends EventEmitter {
  private cancelled = false;

  cancel(): void {
    this.cancelled = true;
  }

  getOutputExtension(compress: BackupOptions['compress']): string {
    switch (compress) {
      case 'gzip': return '.img.gz';
      case 'zstd': return '.img.zst';
      default: return '.img';
    }
  }

  generateOutputFilename(sourceDrive: string, compress: BackupOptions['compress']): string {
    const date = new Date().toISOString().split('T')[0];
    const driveName = path.basename(sourceDrive).replace(/[^a-zA-Z0-9]/g, '_');
    return `spark_backup_${driveName}_${date}${this.getOutputExtension(compress)}`;
  }

  validateBackupOptions(options: BackupOptions): string[] {
    const errors: string[] = [];

    if (!options.sourceDrive) {
      errors.push('Source drive is required');
    }

    if (!options.outputPath) {
      errors.push('Output path is required');
    }

    if (options.outputPath) {
      const dir = path.dirname(options.outputPath);
      if (!fs.existsSync(dir)) {
        errors.push(`Output directory does not exist: ${dir}`);
      }

      // Check available space (rough estimate)
      try {
        const stats = fs.statfsSync(dir);
        const available = stats.bavail * stats.bsize;
        if (available < 1024 * 1024 * 100) {
          errors.push('Less than 100 MB available on output drive');
        }
      } catch {
        // statfsSync may not be available
      }
    }

    return errors;
  }

  estimateBackupSize(totalBytes: number, compress: BackupOptions['compress']): number {
    switch (compress) {
      case 'gzip': return Math.round(totalBytes * 0.6);
      case 'zstd': return Math.round(totalBytes * 0.5);
      default: return totalBytes;
    }
  }
}

export class DriveClone extends EventEmitter {
  private cancelled = false;

  cancel(): void {
    this.cancelled = true;
  }

  validateClone(source: string, target: string): string[] {
    const errors: string[] = [];
    if (source === target) {
      errors.push('Source and target drives must be different');
    }
    return errors;
  }
}
