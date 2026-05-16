import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
	detectPartitionTable,
	getPartitionSchemeName,
	getBootModeCompat,
} from '../../../lib/gui/app/utils/partition-table';

describe('Partition table detection', function () {
	let tmpDir: string;

	beforeEach(function () {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spark-pt-'));
	});

	afterEach(function () {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	describe('detectPartitionTable()', function () {
		it('should detect MBR signature', function () {
			const filePath = path.join(tmpDir, 'mbr.img');
			const buf = Buffer.alloc(1024);
			// MBR signature at offset 510-511
			buf.writeUInt16LE(0xAA55, 510);
			// One partition entry at offset 446: type = 0x83 (Linux)
			buf[446 + 4] = 0x83;
			buf[446] = 0x80; // bootable
			fs.writeFileSync(filePath, buf);
			const result = detectPartitionTable(filePath);
			expect(result.scheme).to.equal('mbr');
			expect(result.bootable).to.be.true;
			expect(result.partitionCount).to.equal(1);
		});

		it('should detect GPT header', function () {
			const filePath = path.join(tmpDir, 'gpt.img');
			const buf = Buffer.alloc(1024);
			// Protective MBR
			buf.writeUInt16LE(0xAA55, 510);
			// GPT signature at LBA 1 (offset 512)
			buf.write('EFI PART', 512, 'ascii');
			fs.writeFileSync(filePath, buf);
			const result = detectPartitionTable(filePath);
			expect(result.scheme).to.equal('gpt');
		});

		it('should return unknown for empty file', function () {
			const filePath = path.join(tmpDir, 'empty.img');
			fs.writeFileSync(filePath, Buffer.alloc(256));
			const result = detectPartitionTable(filePath);
			expect(result.scheme).to.equal('unknown');
		});

		it('should return unknown for non-existent file', function () {
			const result = detectPartitionTable('/tmp/no-such-file-spark-test.img');
			expect(result.scheme).to.equal('unknown');
		});

		it('should detect multiple MBR partitions', function () {
			const filePath = path.join(tmpDir, 'multi.img');
			const buf = Buffer.alloc(1024);
			buf.writeUInt16LE(0xAA55, 510);
			buf[446 + 4] = 0x83; // Partition 1
			buf[446 + 16 + 4] = 0x82; // Partition 2
			buf[446 + 32 + 4] = 0x07; // Partition 3
			fs.writeFileSync(filePath, buf);
			const result = detectPartitionTable(filePath);
			expect(result.scheme).to.equal('mbr');
			expect(result.partitionCount).to.equal(3);
		});
	});

	describe('getPartitionSchemeName()', function () {
		it('should format MBR', function () {
			expect(getPartitionSchemeName('mbr')).to.include('MBR');
		});

		it('should format GPT', function () {
			expect(getPartitionSchemeName('gpt')).to.include('GPT');
		});
	});

	describe('getBootModeCompat()', function () {
		it('should return Legacy BIOS for MBR', function () {
			expect(getBootModeCompat('mbr')).to.equal('Legacy BIOS');
		});

		it('should return UEFI for GPT', function () {
			expect(getBootModeCompat('gpt')).to.equal('UEFI');
		});
	});
});
