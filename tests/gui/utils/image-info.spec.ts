import { expect } from 'chai';
import {
	getImageFormatInfo,
	isRawDiskImage,
	getFormatDescription,
} from '../../../lib/gui/app/utils/image-info';

describe('Image format info', function () {
	describe('getImageFormatInfo()', function () {
		it('should detect gzip compression', function () {
			const info = getImageFormatInfo('ubuntu.img.gz');
			expect(info.compressed).to.be.true;
			expect(info.compressionType).to.equal('gzip');
			expect(info.baseFormat).to.equal('img');
		});

		it('should detect xz compression', function () {
			const info = getImageFormatInfo('arch.img.xz');
			expect(info.compressed).to.be.true;
			expect(info.compressionType).to.equal('xz');
		});

		it('should detect zstd compression', function () {
			const info = getImageFormatInfo('fedora.raw.zst');
			expect(info.compressed).to.be.true;
			expect(info.compressionType).to.equal('zstd');
		});

		it('should handle raw ISO', function () {
			const info = getImageFormatInfo('ubuntu-24.04.iso');
			expect(info.compressed).to.be.false;
			expect(info.baseFormat).to.equal('iso');
		});

		it('should handle bzip2', function () {
			const info = getImageFormatInfo('image.img.bz2');
			expect(info.compressed).to.be.true;
			expect(info.compressionType).to.equal('bzip2');
		});
	});

	describe('isRawDiskImage()', function () {
		it('should return true for .img', function () {
			expect(isRawDiskImage('test.img')).to.be.true;
		});
		it('should return true for .iso', function () {
			expect(isRawDiskImage('test.iso')).to.be.true;
		});
		it('should return false for .gz', function () {
			expect(isRawDiskImage('test.gz')).to.be.false;
		});
		it('should return true for .dmg', function () {
			expect(isRawDiskImage('test.dmg')).to.be.true;
		});
	});

	describe('getFormatDescription()', function () {
		it('should describe compressed image', function () {
			const info = getImageFormatInfo('test.img.xz');
			expect(getFormatDescription(info)).to.include('xz');
		});
		it('should describe raw image', function () {
			const info = getImageFormatInfo('test.iso');
			expect(getFormatDescription(info)).to.include('iso');
		});
	});
});
