/**
 * Download manager for fetching images from URLs.
 * Supports progress tracking, resume, and basic validation.
 */

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

export interface DownloadProgress {
	bytesDownloaded: number;
	totalBytes: number | null;
	percentage: number | null;
	speedBps: number;
}

export interface DownloadOptions {
	url: string;
	destination: string;
	onProgress?: (progress: DownloadProgress) => void;
	headers?: Record<string, string>;
	timeout?: number;
}

export interface DownloadResult {
	success: boolean;
	filePath: string;
	bytesDownloaded: number;
	durationMs: number;
	error?: string;
}

/**
 * Download a file from a URL with progress tracking.
 */
export function downloadFile(options: DownloadOptions): Promise<DownloadResult> {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		const parsedUrl = new URL(options.url);
		const protocol = parsedUrl.protocol === 'https:' ? https : http;

		const dir = path.dirname(options.destination);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		const requestOptions = {
			hostname: parsedUrl.hostname,
			port: parsedUrl.port,
			path: parsedUrl.pathname + parsedUrl.search,
			headers: options.headers || {},
			timeout: options.timeout || 30000,
		};

		const req = protocol.get(requestOptions, (res) => {
			if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
				// Handle redirect
				downloadFile({ ...options, url: res.headers.location })
					.then(resolve)
					.catch(reject);
				return;
			}

			if (res.statusCode && res.statusCode >= 400) {
				resolve({
					success: false,
					filePath: options.destination,
					bytesDownloaded: 0,
					durationMs: Date.now() - startTime,
					error: `HTTP ${res.statusCode}`,
				});
				return;
			}

			const totalBytes = res.headers['content-length']
				? parseInt(res.headers['content-length'], 10)
				: null;

			let bytesDownloaded = 0;
			let lastProgressTime = Date.now();
			let lastBytes = 0;

			const fileStream = fs.createWriteStream(options.destination);

			res.on('data', (chunk: Buffer) => {
				bytesDownloaded += chunk.length;
				const now = Date.now();
				const elapsed = now - lastProgressTime;

				if (elapsed >= 500 && options.onProgress) {
					const speedBps = ((bytesDownloaded - lastBytes) / elapsed) * 1000;
					options.onProgress({
						bytesDownloaded,
						totalBytes,
						percentage: totalBytes ? (bytesDownloaded / totalBytes) * 100 : null,
						speedBps,
					});
					lastProgressTime = now;
					lastBytes = bytesDownloaded;
				}
			});

			res.pipe(fileStream);

			fileStream.on('finish', () => {
				resolve({
					success: true,
					filePath: options.destination,
					bytesDownloaded,
					durationMs: Date.now() - startTime,
				});
			});

			fileStream.on('error', (err) => {
				resolve({
					success: false,
					filePath: options.destination,
					bytesDownloaded,
					durationMs: Date.now() - startTime,
					error: err.message,
				});
			});
		});

		req.on('error', (err) => {
			resolve({
				success: false,
				filePath: options.destination,
				bytesDownloaded: 0,
				durationMs: Date.now() - startTime,
				error: err.message,
			});
		});

		req.on('timeout', () => {
			req.destroy();
			resolve({
				success: false,
				filePath: options.destination,
				bytesDownloaded: 0,
				durationMs: Date.now() - startTime,
				error: 'Request timed out',
			});
		});
	});
}

/**
 * Validate a URL for downloading.
 */
export function isValidDownloadUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

/**
 * Get filename from URL or Content-Disposition header.
 */
export function getFilenameFromUrl(url: string): string {
	try {
		const parsed = new URL(url);
		const pathname = parsed.pathname;
		const parts = pathname.split('/');
		const last = parts[parts.length - 1];
		return decodeURIComponent(last) || 'download';
	} catch {
		return 'download';
	}
}
