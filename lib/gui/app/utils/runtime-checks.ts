/**
 * Runtime environment validation.
 * Checks for common issues that may prevent Spark from working correctly.
 */

import * as os from 'os';
import * as fs from 'fs';

export interface RuntimeIssue {
	severity: 'error' | 'warning';
	message: string;
	suggestion: string;
}

/**
 * Run all runtime checks and return any issues found.
 */
export function checkRuntime(): RuntimeIssue[] {
	const issues: RuntimeIssue[] = [];

	// Check Node.js version
	const nodeVersion = process.versions.node.split('.').map(Number);
	if (nodeVersion[0] < 18) {
		issues.push({
			severity: 'error',
			message: `Node.js ${process.versions.node} is unsupported`,
			suggestion: 'Spark requires Node.js 18 or later.',
		});
	}

	// Check available disk space for temp operations
	if (os.platform() !== 'win32') {
		try {
			const tmpDir = os.tmpdir();
			const stat = fs.statfsSync(tmpDir);
			const freeBytes = stat.bavail * stat.bsize;
			if (freeBytes < 512 * 1024 * 1024) {
				issues.push({
					severity: 'warning',
					message: 'Low disk space in temp directory',
					suggestion: `Only ${Math.round(freeBytes / (1024 * 1024))}MB available in ${tmpDir}. Compressed images may fail to extract.`,
				});
			}
		} catch {
			// statfsSync not available on all platforms
		}
	}

	// Check available memory
	const freeMem = os.freemem();
	if (freeMem < 256 * 1024 * 1024) {
		issues.push({
			severity: 'warning',
			message: 'Low available memory',
			suggestion: `Only ${Math.round(freeMem / (1024 * 1024))}MB available. Flash operations may be slow.`,
		});
	}

	// Check for common Linux permission issues
	if (os.platform() === 'linux') {
		// Check if user is in 'disk' group (needed for raw device access)
		try {
			const groups = require('child_process')
				.execSync('groups', { encoding: 'utf-8' })
				.trim();
			if (!groups.includes('disk') && process.getuid?.() !== 0) {
				issues.push({
					severity: 'warning',
					message: 'User not in "disk" group',
					suggestion: 'You may need to run Spark with elevated privileges to access USB drives.',
				});
			}
		} catch {
			// Ignore
		}
	}

	return issues;
}

/**
 * Check if the current environment can run flash operations.
 */
export function canFlash(): boolean {
	const issues = checkRuntime();
	return !issues.some((i) => i.severity === 'error');
}
