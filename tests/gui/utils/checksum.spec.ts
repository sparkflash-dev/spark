import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import {
	findChecksumFile,
	computeSHA256,
	verifyChecksum,
} from '../../../lib/gui/app/utils/checksum';

describe('Checksum utilities', function () {
	let tmpDir: string;

	beforeEach(function () {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spark-checksum-test-'));
	});

	afterEach(function () {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	describe('findChecksumFile()', function () {
		it('should return null when no checksum file exists', function () {
			const imagePath = path.join(tmpDir, 'test.img');
			fs.writeFileSync(imagePath, 'data');
			expect(findChecksumFile(imagePath)).to.be.null;
		});

		it('should find .sha256sum file', function () {
			const imagePath = path.join(tmpDir, 'test.img');
			const checksumPath = imagePath + '.sha256sum';
			fs.writeFileSync(imagePath, 'data');
			fs.writeFileSync(checksumPath, 'abc123');
			expect(findChecksumFile(imagePath)).to.equal(checksumPath);
		});

		it('should find .sha256 file', function () {
			const imagePath = path.join(tmpDir, 'test.img');
			const checksumPath = imagePath + '.sha256';
			fs.writeFileSync(imagePath, 'data');
			fs.writeFileSync(checksumPath, 'abc123');
			expect(findChecksumFile(imagePath)).to.equal(checksumPath);
		});

		it('should find .SHA256SUM file', function () {
			const imagePath = path.join(tmpDir, 'test.img');
			const checksumPath = imagePath + '.SHA256SUM';
			fs.writeFileSync(imagePath, 'data');
			fs.writeFileSync(checksumPath, 'abc123');
			expect(findChecksumFile(imagePath)).to.equal(checksumPath);
		});

		it('should prefer .sha256sum over .sha256', function () {
			const imagePath = path.join(tmpDir, 'test.img');
			fs.writeFileSync(imagePath, 'data');
			fs.writeFileSync(imagePath + '.sha256sum', 'first');
			fs.writeFileSync(imagePath + '.sha256', 'second');
			expect(findChecksumFile(imagePath)).to.equal(
				imagePath + '.sha256sum',
			);
		});
	});

	describe('computeSHA256()', function () {
		it('should compute correct SHA256 hash of a file', async function () {
			const filePath = path.join(tmpDir, 'test.bin');
			const content = 'hello spark checksum test';
			fs.writeFileSync(filePath, content);

			const expected = crypto
				.createHash('sha256')
				.update(content)
				.digest('hex');
			const actual = await computeSHA256(filePath);
			expect(actual).to.equal(expected);
		});

		it('should call progress callback', async function () {
			const filePath = path.join(tmpDir, 'test.bin');
			// Write enough data to trigger progress (64KB default chunk)
			fs.writeFileSync(filePath, Buffer.alloc(1024, 0x42));

			const progressValues: number[] = [];
			await computeSHA256(filePath, (percent) => {
				progressValues.push(percent);
			});

			expect(progressValues.length).to.be.greaterThan(0);
			expect(progressValues[progressValues.length - 1]).to.equal(100);
		});

		it('should handle empty files', async function () {
			const filePath = path.join(tmpDir, 'empty.bin');
			fs.writeFileSync(filePath, '');

			const expected = crypto.createHash('sha256').update('').digest('hex');
			const actual = await computeSHA256(filePath);
			expect(actual).to.equal(expected);
		});
	});

	describe('verifyChecksum()', function () {
		it('should return null when no checksum file exists', async function () {
			const imagePath = path.join(tmpDir, 'test.img');
			fs.writeFileSync(imagePath, 'data');

			const result = await verifyChecksum(imagePath);
			expect(result).to.be.null;
		});

		it('should verify matching checksum (standard format)', async function () {
			const imagePath = path.join(tmpDir, 'test.img');
			const content = 'test image content';
			fs.writeFileSync(imagePath, content);

			const hash = crypto
				.createHash('sha256')
				.update(content)
				.digest('hex');
			fs.writeFileSync(
				imagePath + '.sha256sum',
				`${hash}  test.img\n`,
			);

			const result = await verifyChecksum(imagePath);
			expect(result).to.not.be.null;
			expect(result!.verified).to.be.true;
			expect(result!.expected).to.equal(hash);
			expect(result!.actual).to.equal(hash);
		});

		it('should detect mismatched checksum', async function () {
			const imagePath = path.join(tmpDir, 'test.img');
			fs.writeFileSync(imagePath, 'actual content');

			const fakeHash = 'a'.repeat(64);
			fs.writeFileSync(
				imagePath + '.sha256sum',
				`${fakeHash}  test.img\n`,
			);

			const result = await verifyChecksum(imagePath);
			expect(result).to.not.be.null;
			expect(result!.verified).to.be.false;
			expect(result!.expected).to.equal(fakeHash);
			expect(result!.actual).to.not.equal(fakeHash);
		});

		it('should handle bare hash format (no filename)', async function () {
			const imagePath = path.join(tmpDir, 'test.img');
			const content = 'bare hash test';
			fs.writeFileSync(imagePath, content);

			const hash = crypto
				.createHash('sha256')
				.update(content)
				.digest('hex');
			fs.writeFileSync(imagePath + '.sha256', hash);

			const result = await verifyChecksum(imagePath);
			expect(result).to.not.be.null;
			expect(result!.verified).to.be.true;
		});

		it('should handle binary indicator format (hash *filename)', async function () {
			const imagePath = path.join(tmpDir, 'test.img');
			const content = 'binary indicator test';
			fs.writeFileSync(imagePath, content);

			const hash = crypto
				.createHash('sha256')
				.update(content)
				.digest('hex');
			fs.writeFileSync(
				imagePath + '.sha256sum',
				`${hash} *test.img\n`,
			);

			const result = await verifyChecksum(imagePath);
			expect(result).to.not.be.null;
			expect(result!.verified).to.be.true;
		});

		it('should skip comment lines in checksum file', async function () {
			const imagePath = path.join(tmpDir, 'test.img');
			const content = 'comment test';
			fs.writeFileSync(imagePath, content);

			const hash = crypto
				.createHash('sha256')
				.update(content)
				.digest('hex');
			fs.writeFileSync(
				imagePath + '.sha256sum',
				`# This is a comment\n${hash}  test.img\n`,
			);

			const result = await verifyChecksum(imagePath);
			expect(result).to.not.be.null;
			expect(result!.verified).to.be.true;
		});

		it('should report error when hash not found for image in multi-file checksum', async function () {
			const imagePath = path.join(tmpDir, 'test.img');
			fs.writeFileSync(imagePath, 'data');

			const otherHash = 'b'.repeat(64);
			fs.writeFileSync(
				imagePath + '.sha256sum',
				`${otherHash}  other-file.img\n`,
			);

			const result = await verifyChecksum(imagePath);
			expect(result).to.not.be.null;
			expect(result!.verified).to.be.false;
			expect(result!.error).to.include('Could not find matching hash');
		});
	});
});
