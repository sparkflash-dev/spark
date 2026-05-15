/**
 * Configuration export/import utility.
 * Allows users to backup and restore Spark settings.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';

export interface ExportedConfig {
	version: string;
	exportedAt: string;
	settings: Record<string, any>;
}

function getConfigDir(): string {
	const app = electron.app || require('@electron/remote').app;
	return app.getPath('userData');
}

/**
 * Export current settings to a JSON file.
 */
export async function exportConfig(outputPath: string): Promise<void> {
	const configPath = path.join(getConfigDir(), 'config.json');
	let settings: Record<string, any> = {};

	try {
		const data = fs.readFileSync(configPath, 'utf-8');
		settings = JSON.parse(data);
	} catch {
		// Default empty config
	}

	const { version } = require('../../../../../package.json');

	const exported: ExportedConfig = {
		version,
		exportedAt: new Date().toISOString(),
		settings,
	};

	fs.writeFileSync(outputPath, JSON.stringify(exported, null, 2));
}

/**
 * Import settings from an exported config file.
 * Returns the number of settings imported.
 */
export async function importConfig(inputPath: string): Promise<number> {
	const data = fs.readFileSync(inputPath, 'utf-8');
	const imported: ExportedConfig = JSON.parse(data);

	if (!imported.settings || typeof imported.settings !== 'object') {
		throw new Error('Invalid config file: missing settings object');
	}

	const configPath = path.join(getConfigDir(), 'config.json');

	// Merge with existing settings (imported values take priority)
	let existing: Record<string, any> = {};
	try {
		const currentData = fs.readFileSync(configPath, 'utf-8');
		existing = JSON.parse(currentData);
	} catch {
		// Start fresh
	}

	const merged = { ...existing, ...imported.settings };
	fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));

	return Object.keys(imported.settings).length;
}

/**
 * Get the default export filename.
 */
export function getDefaultExportFilename(): string {
	const date = new Date().toISOString().split('T')[0];
	return `spark-config-${date}.json`;
}
