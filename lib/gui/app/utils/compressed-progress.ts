/**
 * Compressed image progress — accurate progress for gzip/zstd/xz streams.
 * Tracks both compressed bytes read and decompressed bytes written.
 */

export interface CompressedProgress {
  compressedBytesRead: number;
  compressedTotal: number;
  decompressedBytesWritten: number;
  estimatedDecompressedTotal: number;
  compressionRatio: number;
  readPercent: number;
  writePercent: number;
  displayPercent: number;
}

export function calculateCompressedProgress(
  compressedRead: number,
  compressedTotal: number,
  decompressedWritten: number,
): CompressedProgress {
  const readPercent = compressedTotal > 0 ? (compressedRead / compressedTotal) * 100 : 0;

  // Estimate decompressed total from current ratio
  const compressionRatio = compressedRead > 0 ? decompressedWritten / compressedRead : 2.5;
  const estimatedDecompressedTotal = compressedTotal * compressionRatio;
  const writePercent = estimatedDecompressedTotal > 0
    ? (decompressedWritten / estimatedDecompressedTotal) * 100
    : 0;

  // Use read percent as primary (more reliable for compressed streams)
  const displayPercent = Math.min(readPercent, 100);

  return {
    compressedBytesRead: compressedRead,
    compressedTotal,
    decompressedBytesWritten: decompressedWritten,
    estimatedDecompressedTotal,
    compressionRatio,
    readPercent,
    writePercent,
    displayPercent,
  };
}

export function detectCompression(filename: string): 'gzip' | 'xz' | 'zstd' | 'bzip2' | 'zip' | 'none' {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.gz') || lower.endsWith('.gzip')) return 'gzip';
  if (lower.endsWith('.xz')) return 'xz';
  if (lower.endsWith('.zst') || lower.endsWith('.zstd')) return 'zstd';
  if (lower.endsWith('.bz2')) return 'bzip2';
  if (lower.endsWith('.zip')) return 'zip';
  return 'none';
}

export function getCompressionLabel(type: ReturnType<typeof detectCompression>): string {
  const labels: Record<string, string> = {
    gzip: 'gzip compressed',
    xz: 'xz compressed',
    zstd: 'Zstandard compressed',
    bzip2: 'bzip2 compressed',
    zip: 'ZIP archive',
    none: 'uncompressed',
  };
  return labels[type] || type;
}
