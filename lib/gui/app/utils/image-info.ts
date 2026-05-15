/**
 * Image format detection and metadata extraction.
 * Provides additional info about the source image beyond what etcher-sdk returns.
 */

import * as path from 'path';
import * as fs from 'fs';

export interface ImageFormatInfo {
	extension: string;
	compressed: boolean;
	compressionType?: 'gzip' | 'bzip2' | 'xz' | 'zstd' | 'zip';
	baseFormat?: string;
	estimatedRatio?: number;
}

const COMPRESSION_MAP: Record<string, { type: ImageFormatInfo['compressionType']; ratio: number }> = {
	gz: { type: 'gzip', ratio: 0.6 },
	bz2: { type: 'bzip2', ratio: 0.5 },
	xz: { type: 'xz', ratio: 0.4 },
	zst: { type: 'zstd', ratio: 0.45 },
	zstd: { type: 'zstd', ratio: 0.45 },
	zip: { type: 'zip', ratio: 0.6 },
};

const RAW_FORMATS = new Set(['img', 'iso', 'raw', 'bin', 'dsk', 'dmg', 'hddimg', 'sdcard', 'rpi-sdimg', 'wic', 'vhd', 'etch']);

/**
 * Analyze an image file and return format details.
 */
export function getImageFormatInfo(imagePath: string): ImageFormatInfo {
	const basename = path.basename(imagePath);
	const parts = basename.split('.');
	const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';

	const compression = COMPRESSION_MAP[ext];
	if (compression) {
		const innerExt = parts.length > 2 ? parts[parts.length - 2].toLowerCase() : '';
		return {
			extension: ext,
			compressed: true,
			compressionType: compression.type,
			baseFormat: innerExt || undefined,
			estimatedRatio: compression.ratio,
		};
	}

	return {
		extension: ext,
		compressed: false,
		baseFormat: ext,
	};
}

/**
 * Estimate the uncompressed size of a compressed image.
 */
export function estimateUncompressedSize(filePath: string): number | null {
	try {
		const stat = fs.statSync(filePath);
		const info = getImageFormatInfo(filePath);
		if (info.compressed && info.estimatedRatio) {
			return Math.round(stat.size / info.estimatedRatio);
		}
		return stat.size;
	} catch {
		return null;
	}
}

/**
 * Check if a file looks like a raw disk image (not compressed).
 */
export function isRawDiskImage(imagePath: string): boolean {
	const ext = path.extname(imagePath).slice(1).toLowerCase();
	return RAW_FORMATS.has(ext);
}

/**
 * Get a human-readable description of the image format.
 */
export function getFormatDescription(info: ImageFormatInfo): string {
	if (info.compressed) {
		const base = info.baseFormat ? `.${info.baseFormat}` : 'image';
		return `${base} compressed with ${info.compressionType}`;
	}
	return info.baseFormat ? `.${info.baseFormat} disk image` : 'unknown format';
}
