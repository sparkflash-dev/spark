/**
 * Plugin system foundation — load and manage community extensions.
 * Plugins can add custom image handlers, post-flash scripts, and UI panels.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  sparkVersion: string; // minimum Spark version
  main: string;
  type: 'image-handler' | 'post-flash' | 'ui-panel' | 'drive-filter';
  permissions: PluginPermission[];
}

export type PluginPermission = 'fs-read' | 'fs-write' | 'network' | 'shell' | 'drive-access';

export interface LoadedPlugin {
  manifest: PluginManifest;
  path: string;
  enabled: boolean;
  loadError?: string;
}

const PLUGINS_DIR = path.join(os.homedir(), '.spark', 'plugins');

export function getPluginsDirectory(): string {
  return PLUGINS_DIR;
}

export function ensurePluginsDirectory(): void {
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  }
}

export function discoverPlugins(): LoadedPlugin[] {
  ensurePluginsDirectory();
  const plugins: LoadedPlugin[] = [];

  try {
    const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const manifestPath = path.join(PLUGINS_DIR, entry.name, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        plugins.push({
          manifest,
          path: path.join(PLUGINS_DIR, entry.name),
          enabled: true,
        });
      } catch (err) {
        plugins.push({
          manifest: { name: entry.name, version: '0.0.0', description: '', author: '', sparkVersion: '', main: '', type: 'post-flash', permissions: [] },
          path: path.join(PLUGINS_DIR, entry.name),
          enabled: false,
          loadError: `Invalid manifest: ${err}`,
        });
      }
    }
  } catch {
    // plugins dir not readable
  }

  return plugins;
}

export function validateManifest(manifest: PluginManifest): string[] {
  const errors: string[] = [];
  if (!manifest.name) errors.push('Plugin name is required');
  if (!manifest.version) errors.push('Plugin version is required');
  if (!manifest.main) errors.push('Plugin main entry point is required');
  if (!manifest.type) errors.push('Plugin type is required');

  const validTypes = ['image-handler', 'post-flash', 'ui-panel', 'drive-filter'];
  if (manifest.type && !validTypes.includes(manifest.type)) {
    errors.push(`Invalid plugin type: ${manifest.type}`);
  }

  const dangerousPerms: PluginPermission[] = ['shell', 'drive-access'];
  const dangerous = manifest.permissions.filter((p) => dangerousPerms.includes(p));
  if (dangerous.length > 0) {
    errors.push(`Plugin requests dangerous permissions: ${dangerous.join(', ')}`);
  }

  return errors;
}

export function isPluginCompatible(manifest: PluginManifest, sparkVersion: string): boolean {
  if (!manifest.sparkVersion) return true;
  const [reqMajor, reqMinor] = manifest.sparkVersion.split('.').map(Number);
  const [curMajor, curMinor] = sparkVersion.split('.').map(Number);
  if (curMajor > reqMajor) return true;
  if (curMajor === reqMajor && curMinor >= reqMinor) return true;
  return false;
}
