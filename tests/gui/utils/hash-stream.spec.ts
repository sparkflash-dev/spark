import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import {
	hashFileStream,
	verifyFileHash,
	detectAlgorithm,
} from '../../../lib/gui/app/utils/hash-stream';

describe('Hash stream utilities', function () {
	let tmpDir: string;

	beforeEach(function () {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spark-hash-'));
	});

	afterEach(function () {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	describe('hashFileStream()', function () {
		it('should compute SHA256 hash of a file', async function () {
			const filePath = path.join(tmpDir, 'test.bin');
			const content = Buffer.from('hello world');
			fs.writeFileSync(filePath, content);

			const expected = crypto.createHash('sha256').update(content).digest('hex');
			const result = await hashFileStream(filePath, 'sha256');
			expect(result.hash).to.equal(expected);
			expect(result.algorithm).to.equal('sha256');
			expect(result.bytesProcessed).to.equal(content.length);
		});

		it('should compute MD5 hash', async function () {
			const filePath = path.join(tmpDir, 'test.bin');
			const content = Buffer.from('test data for md5');
			fs.writeFileSync(filePath, content);

			const expected = crypto.createHash('md5').update(content).digest('hex');
			const result = await hashFileStream(filePath, 'md5');
			expect(result.hash).to.equal(expected);
		});

		it('should report progress', async function () {
			const filePath = path.join(tmpDir, 'big.bin');
			fs.writeFileSync(filePath, Buffer.alloc(1024));

			let progressCalled = false;
			await hashFileStream(filePath, 'sha256', (bytesRead, total) => {
				progressCalled = true;
				expect(total).to.equal(1024);
				expect(bytesRead).to.be.lte(total);
			});
			expect(progressCalled).to.be.true;
		});
	});

	describe('verifyFileHash()', function () {
		it('should return true for matching hash', async function () {
			const filePath = path.join(tmpDir, 'verify.bin');
			const content = Buffer.from('verify me');
			fs.writeFileSync(filePath, content);

			const expected = crypto.createHash('sha256').update(content).digest('hex');
			const result = await verifyFileHash(filePath, expected);
			expect(result).to.be.true;
		});

		it('should return false for non-matching hash', async function () {
			const filePath = path.join(tmpDir, 'verify.bin');
			fs.writeFileSync(filePath, 'some content');
			const result = await verifyFileHash(filePath, 'deadbeef'.repeat(8));
			expect(result).to.be.false;
		});
	});

	describe('detectAlgorithm()', function () {
		it('should detect MD5 (32 chars)', function () {
			expect(detectAlgorithm('d41d8cd98f00b204e9800998ecf8427e')).to.equal('md5');
		});

		it('should detect SHA1 (40 chars)', function () {
			expect(detectAlgorithm('da39a3ee5e6b4b0d3255bfef95601890afd80709')).to.equal('sha1');
		});

		it('should detect SHA256 (64 chars)', function () {
			expect(detectAlgorithm('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')).to.equal('sha256');
		});

		it('should return null for unknown length', function () {
			expect(detectAlgorithm('abc123')).to.be.null;
		});
	});
});
