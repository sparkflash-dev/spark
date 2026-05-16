/**
 * Network speed estimation for URL-based image downloads.
 * Performs a quick bandwidth probe before starting large downloads.
 */

import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

export interface SpeedTestResult {
	speedBps: number;
	speedMbps: number;
	latencyMs: number;
	reliable: boolean;
}

/**
 * Estimate download speed by fetching a small range of the file.
 * Uses HTTP Range header to download first 256KB.
 */
export function estimateDownloadSpeed(url: string, timeoutMs = 5000): Promise<SpeedTestResult> {
	return new Promise((resolve) => {
		const startTime = Date.now();
		let bytesReceived = 0;
		let firstByteTime = 0;
		const parsedUrl = new URL(url);
		const protocol = parsedUrl.protocol === 'https:' ? https : http;

		const options = {
			hostname: parsedUrl.hostname,
			port: parsedUrl.port,
			path: parsedUrl.pathname + parsedUrl.search,
			headers: {
				'User-Agent': 'Spark/3.1.0',
				Range: 'bytes=0-262143', // 256KB probe
			},
			timeout: timeoutMs,
		};

		const req = protocol.get(options, (res) => {
			res.on('data', (chunk: Buffer) => {
				if (!firstByteTime) firstByteTime = Date.now();
				bytesReceived += chunk.length;
			});

			res.on('end', () => {
				const duration = (Date.now() - (firstByteTime || startTime)) / 1000;
				const latency = (firstByteTime || Date.now()) - startTime;
				const speedBps = duration > 0 ? bytesReceived / duration : 0;

				resolve({
					speedBps,
					speedMbps: speedBps / (1024 * 1024),
					latencyMs: latency,
					reliable: bytesReceived >= 65536, // Reliable if we got at least 64KB
				});
			});
		});

		req.on('error', () => {
			resolve({ speedBps: 0, speedMbps: 0, latencyMs: 0, reliable: false });
		});

		req.on('timeout', () => {
			req.destroy();
			const elapsed = Date.now() - startTime;
			const speedBps = elapsed > 0 ? (bytesReceived / elapsed) * 1000 : 0;
			resolve({
				speedBps,
				speedMbps: speedBps / (1024 * 1024),
				latencyMs: elapsed,
				reliable: false,
			});
		});
	});
}

/**
 * Estimate download time based on measured speed.
 */
export function estimateDownloadTime(fileSizeBytes: number, speedBps: number): number {
	if (speedBps <= 0) return Infinity;
	return fileSizeBytes / speedBps;
}

/**
 * Format estimated time for display.
 */
export function formatEstimatedTime(seconds: number): string {
	if (!isFinite(seconds) || seconds < 0) return 'Unknown';
	if (seconds < 60) return `~${Math.ceil(seconds)} seconds`;
	if (seconds < 3600) return `~${Math.ceil(seconds / 60)} minutes`;
	return `~${(seconds / 3600).toFixed(1)} hours`;
}
