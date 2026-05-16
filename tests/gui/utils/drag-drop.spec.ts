import { expect } from 'chai';
import {
	handleFileDrop,
	isAcceptedExtension,
	getAcceptedFormats,
} from '../../../lib/gui/app/utils/drag-drop';

describe('Drag-and-drop utilities', function () {
	describe('isAcceptedExtension()', function () {
		it('should accept .iso files', function () {
			expect(isAcceptedExtension('ubuntu-22.04.iso')).to.be.true;
		});

		it('should accept .img files', function () {
			expect(isAcceptedExtension('raspbian.img')).to.be.true;
		});

		it('should accept .img.gz compressed files', function () {
			expect(isAcceptedExtension('disk.img.gz')).to.be.true;
		});

		it('should accept .img.xz compressed files', function () {
			expect(isAcceptedExtension('armbian.img.xz')).to.be.true;
		});

		it('should accept .raw files', function () {
			expect(isAcceptedExtension('backup.raw')).to.be.true;
		});

		it('should accept .dmg files', function () {
			expect(isAcceptedExtension('macos.dmg')).to.be.true;
		});

		it('should reject .txt files', function () {
			expect(isAcceptedExtension('readme.txt')).to.be.false;
		});

		it('should reject .exe files', function () {
			expect(isAcceptedExtension('installer.exe')).to.be.false;
		});

		it('should reject .pdf files', function () {
			expect(isAcceptedExtension('document.pdf')).to.be.false;
		});
	});

	describe('handleFileDrop()', function () {
		it('should reject empty file list', function () {
			const result = handleFileDrop([]);
			expect(result.accepted).to.be.false;
			expect(result.error).to.include('No files');
		});

		it('should reject multiple files', function () {
			const files = [
				{ name: 'a.iso', path: '/tmp/a.iso' },
				{ name: 'b.iso', path: '/tmp/b.iso' },
			] as any;
			const result = handleFileDrop(files);
			expect(result.accepted).to.be.false;
			expect(result.error).to.include('one file');
		});

		it('should accept valid image file', function () {
			const files = [{ name: 'ubuntu.iso', path: '/tmp/ubuntu.iso' }] as any;
			const result = handleFileDrop(files);
			expect(result.accepted).to.be.true;
			expect(result.fileName).to.equal('ubuntu.iso');
		});

		it('should reject unsupported file type', function () {
			const files = [{ name: 'document.pdf', path: '/tmp/document.pdf' }] as any;
			const result = handleFileDrop(files);
			expect(result.accepted).to.be.false;
			expect(result.error).to.include('Unsupported');
		});
	});

	describe('getAcceptedFormats()', function () {
		it('should return a human-readable string', function () {
			const formats = getAcceptedFormats();
			expect(formats).to.include('.img');
			expect(formats).to.include('.iso');
		});
	});
});
