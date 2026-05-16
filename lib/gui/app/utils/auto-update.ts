/**
 * Auto-update checker for Spark.
 * Checks GitHub releases for newer versions without telemetry.
 */

import * as https from 'https';
import { app } from 'electron';

export interface UpdateInfo {
	available: boolean;
	currentVersion: string;
	latestVersion: string;
	releaseUrl: string;
	releaseNotes: string;
	publishedAt: string;
}

const GITHUB_API = 'https://api.github.com/repos/sparkflash-dev/spark/releases/latest';

/**
 * Check for available updates by comparing with latest GitHub release.
 */
export function checkForUpdates(): Promise<UpdateInfo> {
	return new Promise((resolve, reject) => {
		const currentVersion = getCurrentVersion();

		const options = {
			hostname: 'api.github.com',
			path: '/repos/sparkflash-dev/spark/releases/latest',
			headers: {
				'User-Agent': `Spark/${currentVersion}`,
				Accept: 'application/vnd.github.v3+json',
			},
			timeout: 10000,
		};

		const req = https.get(options, (res) => {
			let data = '';
			res.on('data', (chunk) => { data += chunk; });
			res.on('end', () => {
				try {
					const release = JSON.parse(data);
					const latestVersion = (release.tag_name || '').replace(/^v/, '');
					resolve({
						available: isNewerVersion(latestVersion, currentVersion),
						currentVersion,
						latestVersion,
						releaseUrl: release.html_url || '',
						releaseNotes: release.body || '',
						publishedAt: release.published_at || '',
					});
				} catch (err) {
					reject(new Error('Failed to parse update response'));
				}
			});
		});

		req.on('error', reject);
		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Update check timed out'));
		});
	});
}

/**
 * Get current application version.
 */
export function getCurrentVersion(): string {
	try {
		return app.getVersion();
	} catch {
		return require('../../../../package.json').version;
	}
}

/**
 * Compare semantic versions. Returns true if latest > current.
 */
export function isNewerVersion(latest: string, current: string): boolean {
	const latestParts = latest.split('.').map(Number);
	const currentParts = current.split('.').map(Number);

	for (let i = 0; i < 3; i++) {
		const l = latestParts[i] || 0;
		const c = currentParts[i] || 0;
		if (l > c) return true;
		if (l < c) return false;
	}
	return false;
}
