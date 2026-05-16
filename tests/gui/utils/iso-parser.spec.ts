import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { parseISOHeader, isValidISO } from '../../../lib/gui/app/utils/iso-parser';

describe('ISO parser utilities', function () {
	let tmpDir: string;

	beforeEach(function () {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spark-iso-'));
	});

	afterEach(function () {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	describe('parseISOHeader()', function () {
		it('should parse valid ISO 9660 header', function () {
			const filePath = path.join(tmpDir, 'test.iso');
			// Create minimal ISO with PVD at sector 16
			const buf = Buffer.alloc(34816); // 16 sectors * 2048 + 2048
			const pvdOffset = 32768; // sector 16
			buf[pvdOffset] = 1; // Type: Primary Volume Descriptor
			buf.write('CD001', pvdOffset + 1, 'ascii'); // Standard ID
			buf[pvdOffset + 6] = 1; // Version
			buf.write('TEST_SYSTEM', pvdOffset + 8, 'ascii'); // System ID
			buf.write('MY_VOLUME', pvdOffset + 40, 'ascii'); // Volume ID
			buf.writeUInt16LE(2048, pvdOffset + 128); // Block size
			buf.writeUInt32LE(100, pvdOffset + 80); // Volume space size
			fs.writeFileSync(filePath, buf);

			const info = parseISOHeader(filePath);
			expect(info).to.not.be.null;
			expect(info!.systemId).to.equal('TEST_SYSTEM');
			expect(info!.volumeId).to.equal('MY_VOLUME');
			expect(info!.blockSize).to.equal(2048);
		});

		it('should return null for non-ISO file', function () {
			const filePath = path.join(tmpDir, 'not-iso.bin');
			fs.writeFileSync(filePath, Buffer.alloc(65536));
			expect(parseISOHeader(filePath)).to.be.null;
		});

		it('should return null for file too small', function () {
			const filePath = path.join(tmpDir, 'tiny.iso');
			fs.writeFileSync(filePath, Buffer.alloc(1024));
			expect(parseISOHeader(filePath)).to.be.null;
		});

		it('should return null for non-existent file', function () {
			expect(parseISOHeader('/tmp/nonexistent-iso-test.iso')).to.be.null;
		});
	});

	describe('isValidISO()', function () {
		it('should return true for valid ISO', function () {
			const filePath = path.join(tmpDir, 'valid.iso');
			const buf = Buffer.alloc(34816);
			buf[32768] = 1;
			buf.write('CD001', 32769, 'ascii');
			buf.writeUInt16LE(2048, 32768 + 128);
			fs.writeFileSync(filePath, buf);
			expect(isValidISO(filePath)).to.be.true;
		});

		it('should return false for invalid file', function () {
			const filePath = path.join(tmpDir, 'invalid.iso');
			fs.writeFileSync(filePath, 'not an iso file');
			expect(isValidISO(filePath)).to.be.false;
		});
	});
});
