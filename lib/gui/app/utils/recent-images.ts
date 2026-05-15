/**
 * Recent images list management.
 * Tracks recently used images for quick re-selection in the UI.
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

const MAX_RECENT = 10;
const RECENT_FILE = 'recent-images.json';

export interface RecentImage {
	path: string;
	name: string;
	size: number;
	lastUsed: number;
}

function getStoragePath(): string {
	try {
		return path.join(app.getPath('userData'), RECENT_FILE);
	} catch {
		return path.join(process.env.HOME || '/tmp', '.spark', RECENT_FILE);
	}
}

/**
 * Load recent images list.
 */
export function loadRecentImages(): RecentImage[] {
	try {
		const filePath = getStoragePath();
		if (!fs.existsSync(filePath)) return [];
		const data = fs.readFileSync(filePath, 'utf-8');
		const images: RecentImage[] = JSON.parse(data);
		// Filter out images that no longer exist
		return images.filter((img) => fs.existsSync(img.path));
	} catch {
		return [];
	}
}

/**
 * Add an image to the recent list.
 */
export function addRecentImage(imagePath: string): void {
	try {
		const stat = fs.statSync(imagePath);
		const images = loadRecentImages();

		// Remove if already in list
		const filtered = images.filter((img) => img.path !== imagePath);

		// Add to front
		filtered.unshift({
			path: imagePath,
			name: path.basename(imagePath),
			size: stat.size,
			lastUsed: Date.now(),
		});

		// Trim to max
		const trimmed = filtered.slice(0, MAX_RECENT);

		const storagePath = getStoragePath();
		const dir = path.dirname(storagePath);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(storagePath, JSON.stringify(trimmed, null, 2));
	} catch {
		// Silently fail — non-critical feature
	}
}

/**
 * Clear the recent images list.
 */
export function clearRecentImages(): void {
	try {
		const filePath = getStoragePath();
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	} catch {
		// Silently fail
	}
}
