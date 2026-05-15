import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
	validateImageFile,
	validateDriveSize,
} from '../../../lib/gui/app/utils/file-validation';

describe('File validation utilities', function () {
	let tmpDir: string;

	beforeEach(function () {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spark-test-'));
	});

	afterEach(function () {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	describe('validateImageFile()', function () {
		it('should return error for non-existent file', function () {
			const result = validateImageFile('/tmp/nonexistent-spark-test.img');
			expect(result.valid).to.be.false;
			expect(result.errors).to.have.lengthOf(1);
			expect(result.errors[0]).to.include('not found');
		});

		it('should return error for empty file', function () {
			const filePath = path.join(tmpDir, 'empty.img');
			fs.writeFileSync(filePath, '');
			const result = validateImageFile(filePath);
			expect(result.valid).to.be.false;
			expect(result.errors[0]).to.include('empty');
		});

		it('should warn for very small file', function () {
			const filePath = path.join(tmpDir, 'tiny.img');
			fs.writeFileSync(filePath, 'x'.repeat(100));
			const result = validateImageFile(filePath);
			expect(result.valid).to.be.true;
			expect(result.warnings).to.have.length.greaterThan(0);
			expect(result.warnings[0]).to.include('small');
		});

		it('should pass for valid-looking image file', function () {
			const filePath = path.join(tmpDir, 'test.iso');
			fs.writeFileSync(filePath, Buffer.alloc(1024));
			// Wait a bit so mtime is not too recent
			const stat = fs.statSync(filePath);
			const newTime = new Date(Date.now() - 10000);
			fs.utimesSync(filePath, newTime, newTime);
			const result = validateImageFile(filePath);
			expect(result.valid).to.be.true;
			expect(result.errors).to.have.lengthOf(0);
		});

		it('should warn for uncommon file extension', function () {
			const filePath = path.join(tmpDir, 'image.xyz');
			fs.writeFileSync(filePath, Buffer.alloc(1024));
			const newTime = new Date(Date.now() - 10000);
			fs.utimesSync(filePath, newTime, newTime);
			const result = validateImageFile(filePath);
			expect(result.valid).to.be.true;
			expect(result.warnings.some((w) => w.includes('extension'))).to.be.true;
		});

		it('should warn for recently modified file', function () {
			const filePath = path.join(tmpDir, 'recent.iso');
			fs.writeFileSync(filePath, Buffer.alloc(1024));
			const result = validateImageFile(filePath);
			expect(result.valid).to.be.true;
			expect(result.warnings.some((w) => w.includes('modified'))).to.be.true;
		});
	});

	describe('validateDriveSize()', function () {
		it('should error when drive is smaller than image', function () {
			const result = validateDriveSize(8 * 1024 * 1024 * 1024, 4 * 1024 * 1024 * 1024);
			expect(result.valid).to.be.false;
			expect(result.errors[0]).to.include('larger');
		});

		it('should pass when drive is larger', function () {
			const result = validateDriveSize(2 * 1024 * 1024 * 1024, 8 * 1024 * 1024 * 1024);
			expect(result.valid).to.be.true;
		});

		it('should warn when drive is much larger than image', function () {
			const result = validateDriveSize(512 * 1024 * 1024, 256 * 1024 * 1024 * 1024);
			expect(result.valid).to.be.true;
			expect(result.warnings.some((w) => w.includes('much larger'))).to.be.true;
		});
	});
});
