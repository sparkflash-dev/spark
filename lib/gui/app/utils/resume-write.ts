/**
 * Resume interrupted writes — checkpoint progress for crash recovery.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface WriteCheckpoint {
  imagePath: string;
  driveDevice: string;
  bytesWritten: number;
  totalBytes: number;
  imageChecksum: string;
  timestamp: number;
  blockSize: number;
  lastVerifiedBlock: number;
}

const CHECKPOINT_DIR = path.join(os.tmpdir(), 'spark-checkpoints');

function getCheckpointPath(driveDevice: string): string {
  const safeName = driveDevice.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(CHECKPOINT_DIR, `checkpoint_${safeName}.json`);
}

export function saveCheckpoint(checkpoint: WriteCheckpoint): void {
  if (!fs.existsSync(CHECKPOINT_DIR)) {
    fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
  }
  fs.writeFileSync(getCheckpointPath(checkpoint.driveDevice), JSON.stringify(checkpoint));
}

export function loadCheckpoint(driveDevice: string): WriteCheckpoint | null {
  const cpPath = getCheckpointPath(driveDevice);
  try {
    if (fs.existsSync(cpPath)) {
      const data = JSON.parse(fs.readFileSync(cpPath, 'utf-8'));
      // Checkpoint must be less than 24 hours old
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
    }
  } catch {
    // corrupt checkpoint
  }
  return null;
}

export function clearCheckpoint(driveDevice: string): void {
  const cpPath = getCheckpointPath(driveDevice);
  if (fs.existsSync(cpPath)) {
    fs.unlinkSync(cpPath);
  }
}

export function canResumeWrite(checkpoint: WriteCheckpoint, imagePath: string): {
  canResume: boolean;
  reason?: string;
  resumeOffset: number;
} {
  if (checkpoint.imagePath !== imagePath) {
    return { canResume: false, reason: 'Different image file', resumeOffset: 0 };
  }

  // Resume from last verified block
  const resumeOffset = checkpoint.lastVerifiedBlock * checkpoint.blockSize;

  if (resumeOffset >= checkpoint.totalBytes) {
    return { canResume: false, reason: 'Write was already complete', resumeOffset: 0 };
  }

  return { canResume: true, resumeOffset };
}

export function cleanupOldCheckpoints(maxAgeMs = 24 * 60 * 60 * 1000): number {
  let cleaned = 0;
  try {
    if (!fs.existsSync(CHECKPOINT_DIR)) return 0;
    const files = fs.readdirSync(CHECKPOINT_DIR);
    for (const file of files) {
      const filePath = path.join(CHECKPOINT_DIR, file);
      const stats = fs.statSync(filePath);
      if (Date.now() - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    }
  } catch {
    // ignore
  }
  return cleaned;
}
