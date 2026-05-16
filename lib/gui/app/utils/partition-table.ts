/**
 * Partition table detection from image files.
 * Reads first 512 bytes to detect MBR/GPT layout.
 */

import * as fs from 'fs';

export type PartitionScheme = 'mbr' | 'gpt' | 'unknown';

export interface PartitionInfo {
	scheme: PartitionScheme;
	bootable: boolean;
	partitionCount: number;
}

const MBR_SIGNATURE = 0xAA55;
const GPT_SIGNATURE = 'EFI PART';
const MBR_PARTITION_ENTRY_SIZE = 16;
const MBR_PARTITION_TABLE_OFFSET = 446;

/**
 * Detect partition table type from an image file.
 */
export function detectPartitionTable(filePath: string): PartitionInfo {
	let fd: number;
	try {
		fd = fs.openSync(filePath, 'r');
	} catch {
		return { scheme: 'unknown', bootable: false, partitionCount: 0 };
	}

	try {
		// Read first sector (512 bytes) + GPT header at LBA 1 (512 bytes)
		const buffer = Buffer.alloc(1024);
		const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
		if (bytesRead < 512) {
			return { scheme: 'unknown', bootable: false, partitionCount: 0 };
		}

		// Check MBR signature at offset 510-511
		const signature = buffer.readUInt16LE(510);
		if (signature !== MBR_SIGNATURE) {
			return { scheme: 'unknown', bootable: false, partitionCount: 0 };
		}

		// Check for GPT (EFI PART at LBA 1, offset 512)
		if (bytesRead >= 520) {
			const gptSig = buffer.toString('ascii', 512, 520);
			if (gptSig === GPT_SIGNATURE) {
				// GPT includes a protective MBR, so check GPT header for partition count
				const partCount = bytesRead >= 592 ? buffer.readUInt32LE(592 - 512 + 512) : 0;
				return { scheme: 'gpt', bootable: true, partitionCount: Math.min(partCount, 128) };
			}
		}

		// Parse MBR partition entries
		let partCount = 0;
		let bootable = false;
		for (let i = 0; i < 4; i++) {
			const offset = MBR_PARTITION_TABLE_OFFSET + i * MBR_PARTITION_ENTRY_SIZE;
			const status = buffer[offset];
			const type = buffer[offset + 4];
			if (type !== 0) {
				partCount++;
				if (status === 0x80) bootable = true;
			}
		}

		return { scheme: 'mbr', bootable, partitionCount: partCount };
	} catch {
		return { scheme: 'unknown', bootable: false, partitionCount: 0 };
	} finally {
		fs.closeSync(fd);
	}
}

/**
 * Get human-readable partition scheme name.
 */
export function getPartitionSchemeName(scheme: PartitionScheme): string {
	switch (scheme) {
		case 'mbr': return 'MBR (Master Boot Record)';
		case 'gpt': return 'GPT (GUID Partition Table)';
		default: return 'Unknown';
	}
}

/**
 * Determine boot mode compatibility from partition scheme.
 */
export function getBootModeCompat(scheme: PartitionScheme): string {
	switch (scheme) {
		case 'mbr': return 'Legacy BIOS';
		case 'gpt': return 'UEFI';
		default: return 'Unknown';
	}
}
