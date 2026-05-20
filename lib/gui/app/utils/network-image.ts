/**
 * Network image download — flash from HTTP/HTTPS URL with resume support.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { EventEmitter } from 'events';

export interface DownloadOptions {
  url: string;
  outputDir?: string;
  filename?: string;
  resume?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface DownloadProgress {
  bytesDownloaded: number;
  totalBytes: number;
  percent: number;
  speed: number;
  eta: number;
}

export interface DownloadResult {
  filePath: string;
  bytesDownloaded: number;
  duration: number;
  resumed: boolean;
  contentType?: string;
}

export function parseImageUrl(url: string): { hostname: string; filename: string; protocol: string } | null {
  try {
    const parsed = new URL(url);
    const filename = path.basename(parsed.pathname) || 'image.img';
    return {
      hostname: parsed.hostname,
      filename: decodeURIComponent(filename),
      protocol: parsed.protocol,
    };
  } catch {
    return null;
  }
}

export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.iso', '.img', '.img.gz', '.img.xz', '.img.zst', '.img.bz2', '.zip', '.raw', '.dmg', '.wic', '.wic.gz', '.wic.xz'];
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    return imageExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

export function getDefaultDownloadDir(): string {
  return path.join(os.tmpdir(), 'spark-downloads');
}

export function getPartialFilePath(outputPath: string): string {
  return outputPath + '.part';
}

export function canResume(partialPath: string): { canResume: boolean; bytesDownloaded: number } {
  try {
    if (fs.existsSync(partialPath)) {
      const stats = fs.statSync(partialPath);
      return { canResume: true, bytesDownloaded: stats.size };
    }
  } catch {
    // ignore
  }
  return { canResume: false, bytesDownloaded: 0 };
}

export function formatDownloadSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / 1024 / 1024).toFixed(1)} MB/s`;
}

export function estimateDuration(totalBytes: number, speedBytesPerSec: number): string {
  if (speedBytesPerSec <= 0) return 'calculating...';
  const seconds = Math.round(totalBytes / speedBytesPerSec);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
