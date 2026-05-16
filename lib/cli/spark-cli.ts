#!/usr/bin/env node

/**
 * Spark CLI — flash OS images from the command line.
 *
 * Usage:
 *   spark flash --image <path> --drive <device> [--verify] [--no-unmount]
 *   spark list                                  # list available drives
 *   spark --version
 *
 * This module reuses the etcher-sdk directly for flash operations,
 * bypassing the Electron GUI and sidecar WebSocket layer entirely.
 */

import * as yargs from 'yargs';
import * as sdk from 'etcher-sdk';
import { decompressThenFlash } from 'etcher-sdk/build/multi-write';
import { File, BlockDevice } from 'etcher-sdk/build/source-destination';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

const { version } = require('../../package.json');

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024)
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatSpeed(bytesPerSecond: number): string {
	return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
}

function progressBar(percent: number, width = 30): string {
	const filled = Math.round((percent / 100) * width);
	const empty = width - filled;
	return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent.toFixed(1)}%`;
}

async function listDrives(): Promise<void> {
	const scanner = sdk.scanner.createScanner({
		blockdeviceAdapter: {
			includeSystemDrives: () => false,
		},
	});

	return new Promise((resolve) => {
		const drives: any[] = [];

		scanner.on('attach', (drive: any) => {
			drives.push(drive);
		});

		scanner.on('ready', () => {
			// Give a moment for drives to be enumerated
			setTimeout(() => {
				scanner.stop();

				if (drives.length === 0) {
					console.log('No removable drives found.');
					console.log(
						'Tip: Make sure your USB drive is plugged in and not mounted.',
					);
				} else {
					console.log(`Found ${drives.length} drive(s):\n`);
					console.log(
						'  Device'.padEnd(20) +
							'Size'.padEnd(12) +
							'Description',
					);
					console.log('  ' + '-'.repeat(50));
					for (const drive of drives) {
						const dev = (drive.device || drive.raw || '').padEnd(18);
						const size = formatBytes(drive.size || 0).padEnd(12);
						const desc = drive.description || '';
						console.log(`  ${dev}${size}${desc}`);
					}
				}
				console.log('');
				resolve();
			}, 2000);
		});

		scanner.start();
	});
}

async function flashImage(
	imagePath: string,
	drivePath: string,
	options: { verify: boolean; unmount: boolean; trim: boolean },
): Promise<void> {
	// Validate inputs
	if (!fs.existsSync(imagePath)) {
		console.error(`Error: Image file not found: ${imagePath}`);
		process.exit(1);
	}

	const resolvedImage = path.resolve(imagePath);
	console.log(`\n⚡ Spark CLI v${version}`);
	console.log(`   Image:  ${resolvedImage}`);
	console.log(`   Drive:  ${drivePath}`);
	console.log(`   Verify: ${options.verify ? 'yes' : 'no'}`);
	console.log('');

	const source = new File({
		path: resolvedImage,
	});

	const destination = new BlockDevice({
		drive: {
			device: drivePath,
			raw: drivePath,
			devicePath: drivePath,
			size: 0,
			isReadOnly: false,
			isSystem: false,
			isUsbDrive: true,
			isRemovable: true,
			isCard: false,
			isSCSI: false,
			isVirtual: false,
			busType: 'USB',
			mountpoints: [],
			description: '',
		} as any,
		unmountOnSuccess: options.unmount,
		write: true,
		direct: true,
	});

	let lastPhase = '';
	const startTime = Date.now();

	try {
		const results = await decompressThenFlash({
			source,
			destinations: [destination],
			onFail: (_dest: any, error: Error) => {
				console.error(`\n  ✗ Write failed: ${error.message}`);
			},
			onProgress: (progress: any) => {
				const phase = progress.type || 'unknown';
				const percent = progress.percentage || 0;
				const speed = progress.speed || 0;
				const eta = progress.eta || 0;

				if (phase !== lastPhase) {
					if (lastPhase) console.log(''); // newline after previous phase
					lastPhase = phase;
				}

				const phaseLabel =
					phase === 'flashing'
						? 'Writing'
						: phase === 'verifying'
							? 'Verifying'
							: phase === 'decompressing'
								? 'Decompressing'
								: phase;

				const etaStr = eta > 0 ? ` ETA: ${Math.ceil(eta)}s` : '';
				process.stdout.write(
					`\r  ${phaseLabel}: ${progressBar(percent)} ${formatSpeed(speed)}${etaStr}  `,
				);
			},
			verify: options.verify,
			trim: options.trim,
			numBuffers: 16,
			decompressFirst: false,
		} as any);

		const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
		console.log('\n');

		if (results.errors && results.errors.length > 0) {
			console.log(`  ✗ Flash completed with errors (${elapsed}s):`);
			for (const err of results.errors) {
				console.error(`    - ${err.message || err}`);
			}
			process.exit(1);
		} else {
			console.log(`  ✓ Flash completed successfully in ${elapsed}s`);
		}
	} catch (error: any) {
		console.error(`\n  ✗ Fatal error: ${error.message}`);
		process.exit(1);
	} finally {
		try {
			await source.close();
		} catch {
			// ignore
		}
	}
}

async function verifyImage(imagePath: string, drivePath: string): Promise<void> {
	if (!fs.existsSync(imagePath)) {
		console.error(`Error: Image file not found: ${imagePath}`);
		process.exit(1);
	}

	const resolvedImage = path.resolve(imagePath);
	const imageSize = fs.statSync(resolvedImage).size;
	console.log(`\n⚡ Spark CLI v${version} — Verify Mode`);
	console.log(`   Image:  ${resolvedImage} (${formatBytes(imageSize)})`);
	console.log(`   Drive:  ${drivePath}`);
	console.log('');

	const crypto = require('crypto');
	const CHUNK = 4 * 1024 * 1024;
	let offset = 0;
	let mismatch = false;

	const imgFd = fs.openSync(resolvedImage, 'r');
	let drvFd: number;
	try {
		drvFd = fs.openSync(drivePath, 'r');
	} catch (err: any) {
		console.error(`  ✗ Cannot open drive: ${err.message}`);
		console.error('    Try running with sudo.');
		fs.closeSync(imgFd);
		process.exit(1);
	}

	const imgBuf = Buffer.alloc(CHUNK);
	const drvBuf = Buffer.alloc(CHUNK);

	while (offset < imageSize) {
		const toRead = Math.min(CHUNK, imageSize - offset);
		fs.readSync(imgFd, imgBuf, 0, toRead, offset);
		fs.readSync(drvFd, drvBuf, 0, toRead, offset);

		if (!imgBuf.slice(0, toRead).equals(drvBuf.slice(0, toRead))) {
			mismatch = true;
			break;
		}

		offset += toRead;
		const percent = ((offset / imageSize) * 100).toFixed(1);
		process.stdout.write(`\r  Verifying: ${progressBar(parseFloat(percent))} `);
	}

	fs.closeSync(imgFd);
	fs.closeSync(drvFd);
	console.log('\n');

	if (mismatch) {
		console.log(`  ✗ Verification FAILED at offset ${formatBytes(offset)}`);
		console.log('    The drive content does not match the source image.');
		process.exit(1);
	} else {
		console.log(`  ✓ Verification passed — drive matches source image.`);
	}
}

// CLI definition
yargs
	.scriptName('spark')
	.usage('$0 <command> [options]')
	.command(
		'flash',
		'Flash an image to a drive',
		(y: any) => {
			return y
				.option('image', {
					alias: 'i',
					describe: 'Path to image file',
					type: 'string',
					demandOption: true,
				})
				.option('drive', {
					alias: 'd',
					describe: 'Target drive device path (e.g. /dev/sdb)',
					type: 'string',
					demandOption: true,
				})
				.option('verify', {
					alias: 'v',
					describe: 'Verify write after flashing',
					type: 'boolean',
					default: true,
				})
				.option('no-unmount', {
					describe: 'Do not unmount drive after flashing',
					type: 'boolean',
					default: false,
				})
				.option('trim', {
					describe: 'Trim unallocated space (ext partitions)',
					type: 'boolean',
					default: true,
				});
		},
		async (argv: any) => {
			if (process.getuid && process.getuid() !== 0) {
				console.warn(
					'Warning: Flashing usually requires root privileges. Run with sudo if it fails.\n',
				);
			}
			await flashImage(argv.image, argv.drive, {
				verify: argv.verify,
				unmount: !argv['no-unmount'],
				trim: argv.trim,
			});
		},
	)
	.command('list', 'List available drives', {}, async () => {
		await listDrives();
	})
	.command(
		'verify',
		'Verify a written image against source',
		(y: any) => {
			return y
				.option('image', {
					alias: 'i',
					describe: 'Path to original image file',
					type: 'string',
					demandOption: true,
				})
				.option('drive', {
					alias: 'd',
					describe: 'Target drive to verify',
					type: 'string',
					demandOption: true,
				});
		},
		async (argv: any) => {
			await verifyImage(argv.image, argv.drive);
		},
	)
	.version(version)
	.alias('version', 'V')
	.help()
	.alias('help', 'h')
	.demandCommand(1, 'Please specify a command (flash, list, verify)')
	.strict()
	.parse();
