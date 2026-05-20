/**
 * Image library — bookmarks for frequently used ISOs with metadata.
 * Stores image references with checksums for quick access.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ImageBookmark {
  id: string;
  name: string;
  path: string;
  size: number;
  checksum?: string;
  checksumType?: 'sha256' | 'md5';
  addedAt: number;
  lastUsed: number;
  useCount: number;
  tags: string[];
  notes?: string;
}

export interface ImageLibrary {
  version: number;
  bookmarks: ImageBookmark[];
}

const LIBRARY_FILE = '.spark-image-library.json';

function getLibraryPath(): string {
  return path.join(os.homedir(), LIBRARY_FILE);
}

export function loadLibrary(): ImageLibrary {
  const libPath = getLibraryPath();
  try {
    if (fs.existsSync(libPath)) {
      const data = JSON.parse(fs.readFileSync(libPath, 'utf-8'));
      return data;
    }
  } catch {
    // corrupt file, start fresh
  }
  return { version: 1, bookmarks: [] };
}

export function saveLibrary(library: ImageLibrary): void {
  fs.writeFileSync(getLibraryPath(), JSON.stringify(library, null, 2));
}

export function addBookmark(
  imagePath: string,
  options: { name?: string; tags?: string[]; notes?: string; checksum?: string } = {},
): ImageBookmark {
  const library = loadLibrary();
  const existing = library.bookmarks.find((b) => b.path === imagePath);
  if (existing) {
    existing.lastUsed = Date.now();
    existing.useCount++;
    saveLibrary(library);
    return existing;
  }

  const stats = fs.statSync(imagePath);
  const bookmark: ImageBookmark = {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: options.name || path.basename(imagePath),
    path: imagePath,
    size: stats.size,
    checksum: options.checksum,
    checksumType: options.checksum ? 'sha256' : undefined,
    addedAt: Date.now(),
    lastUsed: Date.now(),
    useCount: 1,
    tags: options.tags || [],
    notes: options.notes,
  };

  library.bookmarks.push(bookmark);
  saveLibrary(library);
  return bookmark;
}

export function removeBookmark(id: string): boolean {
  const library = loadLibrary();
  const idx = library.bookmarks.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  library.bookmarks.splice(idx, 1);
  saveLibrary(library);
  return true;
}

export function searchBookmarks(query: string): ImageBookmark[] {
  const library = loadLibrary();
  const q = query.toLowerCase();
  return library.bookmarks.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)) ||
      (b.notes && b.notes.toLowerCase().includes(q)),
  );
}

export function getRecentBookmarks(limit = 5): ImageBookmark[] {
  const library = loadLibrary();
  return [...library.bookmarks].sort((a, b) => b.lastUsed - a.lastUsed).slice(0, limit);
}

export function getMostUsedBookmarks(limit = 5): ImageBookmark[] {
  const library = loadLibrary();
  return [...library.bookmarks].sort((a, b) => b.useCount - a.useCount).slice(0, limit);
}

export function pruneInvalidBookmarks(): number {
  const library = loadLibrary();
  const before = library.bookmarks.length;
  library.bookmarks = library.bookmarks.filter((b) => fs.existsSync(b.path));
  saveLibrary(library);
  return before - library.bookmarks.length;
}
