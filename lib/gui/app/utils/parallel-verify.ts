/**
 * Parallel verification — verify flash with multiple read streams.
 * Splits drive into segments and verifies concurrently.
 */

import * as os from 'os';

export interface VerifySegment {
  id: number;
  startOffset: number;
  endOffset: number;
  status: 'pending' | 'verifying' | 'passed' | 'failed';
  bytesVerified: number;
  mismatchOffset?: number;
}

export interface VerifyConfig {
  segmentCount: number;
  segmentSize: number;
  totalSize: number;
  concurrency: number;
}

export function calculateVerifyConfig(totalSize: number): VerifyConfig {
  const cpuCount = os.cpus().length;
  const concurrency = Math.min(Math.max(cpuCount - 1, 1), 4);

  // Each segment should be at least 64 MB
  const minSegmentSize = 64 * 1024 * 1024;
  let segmentCount = concurrency * 2; // 2 segments per thread for load balancing
  let segmentSize = Math.ceil(totalSize / segmentCount);

  if (segmentSize < minSegmentSize) {
    segmentSize = minSegmentSize;
    segmentCount = Math.ceil(totalSize / segmentSize);
  }

  return { segmentCount, segmentSize, totalSize, concurrency };
}

export function createSegments(config: VerifyConfig): VerifySegment[] {
  const segments: VerifySegment[] = [];
  for (let i = 0; i < config.segmentCount; i++) {
    const start = i * config.segmentSize;
    const end = Math.min(start + config.segmentSize, config.totalSize);
    segments.push({
      id: i,
      startOffset: start,
      endOffset: end,
      status: 'pending',
      bytesVerified: 0,
    });
  }
  return segments;
}

export function getVerifyProgress(segments: VerifySegment[]): {
  totalVerified: number;
  totalSize: number;
  percent: number;
  allPassed: boolean;
  failures: number;
} {
  const totalVerified = segments.reduce((s, seg) => s + seg.bytesVerified, 0);
  const totalSize = segments.reduce((s, seg) => s + (seg.endOffset - seg.startOffset), 0);
  const failures = segments.filter((s) => s.status === 'failed').length;
  const allPassed = segments.every((s) => s.status === 'passed');

  return {
    totalVerified,
    totalSize,
    percent: totalSize > 0 ? (totalVerified / totalSize) * 100 : 0,
    allPassed,
    failures,
  };
}

export function formatVerifyResult(segments: VerifySegment[]): string {
  const progress = getVerifyProgress(segments);
  if (progress.allPassed) {
    return `Verification passed — ${segments.length} segments OK`;
  }
  const failed = segments.filter((s) => s.status === 'failed');
  return `Verification failed — ${failed.length}/${segments.length} segments have mismatches`;
}
