/**
 * Basic ISO 9660 header parser.
 * Extracts volume label, creation date, and system identifier from ISO images.
 */

import * as fs from 'fs';

export interface ISOVolumeInfo {
	systemId: string;
	volumeId: string;
	volumeSetId: string;
	publisherId: string;
	preparerId: string;
	creationDate: string;
	blockSize: number;
	volumeSize: number;
}

const PRIMARY_VOLUME_DESCRIPTOR_OFFSET = 32768; // 16 * 2048
const PVD_TYPE = 1;

/**
 * Parse ISO 9660 Primary Volume Descriptor.
 * Returns basic volume information without reading the full file.
 */
export function parseISOHeader(filePath: string): ISOVolumeInfo | null {
	let fd: number;
	try {
		fd = fs.openSync(filePath, 'r');
	} catch {
		return null;
	}

	try {
		const buffer = Buffer.alloc(2048);
		const bytesRead = fs.readSync(fd, buffer, 0, 2048, PRIMARY_VOLUME_DESCRIPTOR_OFFSET);
		if (bytesRead < 2048) return null;

		// Check CD001 magic
		const magic = buffer.toString('ascii', 1, 6);
		if (magic !== 'CD001') return null;

		// Check type (should be 1 for Primary Volume Descriptor)
		if (buffer[0] !== PVD_TYPE) return null;

		return {
			systemId: buffer.toString('ascii', 8, 40).trim(),
			volumeId: buffer.toString('ascii', 40, 72).trim(),
			volumeSetId: buffer.toString('ascii', 190, 318).trim(),
			publisherId: buffer.toString('ascii', 318, 446).trim(),
			preparerId: buffer.toString('ascii', 446, 574).trim(),
			creationDate: parseISODate(buffer.slice(813, 830)),
			blockSize: buffer.readUInt16LE(128),
			volumeSize: buffer.readUInt32LE(80) * buffer.readUInt16LE(128),
		};
	} catch {
		return null;
	} finally {
		fs.closeSync(fd);
	}
}

/**
 * Parse ISO 9660 date/time format (17 bytes ASCII).
 */
function parseISODate(buf: Buffer): string {
	const str = buf.toString('ascii', 0, 16);
	if (str.trim().length === 0 || str.startsWith('0000')) return '';
	const year = str.substring(0, 4);
	const month = str.substring(4, 6);
	const day = str.substring(6, 8);
	const hour = str.substring(8, 10);
	const min = str.substring(10, 12);
	const sec = str.substring(12, 14);
	return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

/**
 * Check if a file has a valid ISO 9660 header.
 */
export function isValidISO(filePath: string): boolean {
	return parseISOHeader(filePath) !== null;
}

/**
 * Get volume label from an ISO file.
 */
export function getVolumeLabel(filePath: string): string | null {
	const info = parseISOHeader(filePath);
	return info?.volumeId || null;
}
