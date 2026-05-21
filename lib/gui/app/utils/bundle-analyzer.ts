/**
 * Bundle size analysis — identify large dependencies and suggest optimizations.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BundleEntry {
  name: string;
  size: number;
  percentage: number;
  type: 'dependency' | 'source' | 'asset';
}

export interface BundleReport {
  totalSize: number;
  entries: BundleEntry[];
  recommendations: string[];
}

const KNOWN_HEAVY_DEPS: Record<string, { minSize: number; alternative: string }> = {
  'electron': { minSize: 150 * 1024 * 1024, alternative: 'Cannot be replaced — core framework' },
  'rendition': { minSize: 20 * 1024 * 1024, alternative: 'Already removed in Spark' },
  'node-sass': { minSize: 5 * 1024 * 1024, alternative: 'Use sass (Dart Sass) instead' },
  'moment': { minSize: 300 * 1024, alternative: 'Use dayjs or date-fns' },
  'lodash': { minSize: 70 * 1024, alternative: 'Use lodash-es with tree-shaking or native methods' },
};

export function analyzePackageJson(packageJsonPath: string): BundleEntry[] {
  const entries: BundleEntry[] = [];
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...pkg.dependencies };
    const nodeModules = path.join(path.dirname(packageJsonPath), 'node_modules');

    for (const [name] of Object.entries(deps)) {
      const depPath = path.join(nodeModules, name);
      if (fs.existsSync(depPath)) {
        const size = getDirectorySize(depPath);
        entries.push({ name, size, percentage: 0, type: 'dependency' });
      }
    }

    const total = entries.reduce((s, e) => s + e.size, 0);
    for (const entry of entries) {
      entry.percentage = total > 0 ? (entry.size / total) * 100 : 0;
    }

    entries.sort((a, b) => b.size - a.size);
  } catch {
    // ignore errors
  }
  return entries;
}

function getDirectorySize(dirPath: string): number {
  let size = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile()) {
        size += fs.statSync(fullPath).size;
      } else if (entry.isDirectory() && entry.name !== 'node_modules') {
        size += getDirectorySize(fullPath);
      }
    }
  } catch {
    // permission errors etc
  }
  return size;
}

export function getOptimizationSuggestions(entries: BundleEntry[]): string[] {
  const suggestions: string[] = [];
  for (const entry of entries) {
    const known = KNOWN_HEAVY_DEPS[entry.name];
    if (known && entry.size > known.minSize * 0.5) {
      suggestions.push(`${entry.name} (${formatSize(entry.size)}): ${known.alternative}`);
    }
  }
  if (entries.length > 100) {
    suggestions.push('Consider using fewer dependencies — over 100 detected');
  }
  return suggestions;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
