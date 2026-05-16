/**
 * Image metadata cache.
 * Caches parsed image metadata to avoid re-reading large files.
 */

import * as fs from 'fs';
import * as crypto from 'crypto';

interface CacheEntry {
	path: string;
	size: number;
	mtime: number;
	metadata: ImageMetadata;
	cachedAt: number;
}

export interface ImageMetadata {
	format: string;
	compressed: boolean;
	compressionType?: string;
	estimatedSize?: number;
	partitionTable?: string;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, CacheEntry>();

/**
 * Generate a cache key from file path.
 */
function getCacheKey(filePath: string): string {
	return crypto.createHash('md5').update(filePath).digest('hex');
}

/**
 * Check if cache entry is still valid.
 */
function isValid(entry: CacheEntry, filePath: string): boolean {
	if (Date.now() - entry.cachedAt > CACHE_TTL) return false;
	try {
		const stat = fs.statSync(filePath);
		return stat.size === entry.size && stat.mtimeMs === entry.mtime;
	} catch {
		return false;
	}
}

/**
 * Get cached metadata for an image.
 */
export function getCachedMetadata(filePath: string): ImageMetadata | null {
	const key = getCacheKey(filePath);
	const entry = cache.get(key);
	if (!entry) return null;
	if (!isValid(entry, filePath)) {
		cache.delete(key);
		return null;
	}
	return entry.metadata;
}

/**
 * Store metadata in cache.
 */
export function setCachedMetadata(filePath: string, metadata: ImageMetadata): void {
	try {
		const stat = fs.statSync(filePath);
		const key = getCacheKey(filePath);
		cache.set(key, {
			path: filePath,
			size: stat.size,
			mtime: stat.mtimeMs,
			metadata,
			cachedAt: Date.now(),
		});
	} catch {
		// If we can't stat the file, don't cache
	}
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
	cache.clear();
}

/**
 * Get cache statistics.
 */
export function getCacheStats(): { entries: number; hitRate: string } {
	return {
		entries: cache.size,
		hitRate: 'N/A', // Would need hit/miss counters for accurate tracking
	};
}
