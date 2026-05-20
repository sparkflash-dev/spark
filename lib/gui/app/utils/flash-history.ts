/**
 * Flash history — stores records of past flash operations for the dashboard.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface FlashRecord {
  id: string;
  timestamp: number;
  imageName: string;
  imagePath: string;
  imageSize: number;
  driveDevice: string;
  driveDescription: string;
  driveSize: number;
  duration: number; // ms
  bytesWritten: number;
  averageSpeed: number; // bytes/sec
  verified: boolean;
  verificationPassed?: boolean;
  status: 'success' | 'failed' | 'cancelled';
  errorMessage?: string;
}

export interface FlashStats {
  totalFlashes: number;
  successfulFlashes: number;
  failedFlashes: number;
  totalBytesWritten: number;
  totalDuration: number;
  averageSpeed: number;
  mostUsedImage: string | null;
  mostUsedDrive: string | null;
  firstFlash: number | null;
  lastFlash: number | null;
}

const HISTORY_FILE = '.spark-flash-history.json';
const MAX_HISTORY_ENTRIES = 500;

function getHistoryPath(): string {
  return path.join(os.homedir(), HISTORY_FILE);
}

export function loadHistory(): FlashRecord[] {
  try {
    const data = fs.readFileSync(getHistoryPath(), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveHistory(records: FlashRecord[]): void {
  fs.writeFileSync(getHistoryPath(), JSON.stringify(records, null, 2));
}

export function addRecord(record: Omit<FlashRecord, 'id'>): FlashRecord {
  const records = loadHistory();
  const newRecord: FlashRecord = {
    ...record,
    id: `flash-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  records.unshift(newRecord);

  // Prune old entries
  if (records.length > MAX_HISTORY_ENTRIES) {
    records.length = MAX_HISTORY_ENTRIES;
  }

  saveHistory(records);
  return newRecord;
}

export function getStats(): FlashStats {
  const records = loadHistory();
  const successful = records.filter((r) => r.status === 'success');

  const imageCount = new Map<string, number>();
  const driveCount = new Map<string, number>();
  for (const r of records) {
    imageCount.set(r.imageName, (imageCount.get(r.imageName) || 0) + 1);
    driveCount.set(r.driveDescription, (driveCount.get(r.driveDescription) || 0) + 1);
  }

  let mostUsedImage: string | null = null;
  let maxImageCount = 0;
  for (const [name, count] of imageCount) {
    if (count > maxImageCount) { mostUsedImage = name; maxImageCount = count; }
  }

  let mostUsedDrive: string | null = null;
  let maxDriveCount = 0;
  for (const [desc, count] of driveCount) {
    if (count > maxDriveCount) { mostUsedDrive = desc; maxDriveCount = count; }
  }

  const totalBytes = successful.reduce((s, r) => s + r.bytesWritten, 0);
  const totalDuration = successful.reduce((s, r) => s + r.duration, 0);

  return {
    totalFlashes: records.length,
    successfulFlashes: successful.length,
    failedFlashes: records.filter((r) => r.status === 'failed').length,
    totalBytesWritten: totalBytes,
    totalDuration: totalDuration,
    averageSpeed: totalDuration > 0 ? (totalBytes / totalDuration) * 1000 : 0,
    mostUsedImage,
    mostUsedDrive,
    firstFlash: records.length > 0 ? records[records.length - 1].timestamp : null,
    lastFlash: records.length > 0 ? records[0].timestamp : null,
  };
}

export function clearHistory(): void {
  saveHistory([]);
}

export function exportHistory(outputPath: string): void {
  const records = loadHistory();
  const csv = [
    'Date,Image,Drive,Size,Duration(s),Speed(MB/s),Status',
    ...records.map((r) => {
      const date = new Date(r.timestamp).toISOString();
      const sizeMB = (r.imageSize / 1024 / 1024).toFixed(1);
      const durSec = (r.duration / 1000).toFixed(1);
      const speedMBs = (r.averageSpeed / 1024 / 1024).toFixed(1);
      return `${date},${r.imageName},${r.driveDescription},${sizeMB}MB,${durSec},${speedMBs},${r.status}`;
    }),
  ].join('\n');
  fs.writeFileSync(outputPath, csv);
}
