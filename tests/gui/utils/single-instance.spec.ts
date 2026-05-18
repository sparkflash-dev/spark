import { expect } from 'chai';
import { extractFileFromArgs } from '../../../lib/gui/app/utils/single-instance';

describe('Single instance utilities', function () {
	describe('extractFileFromArgs()', function () {
		it('should extract ISO file path', function () {
			const result = extractFileFromArgs(['spark', '/tmp/ubuntu.iso']);
			expect(result).to.equal('/tmp/ubuntu.iso');
		});

		it('should extract IMG file path', function () {
			const result = extractFileFromArgs(['spark', '--debug', '/tmp/raspbian.img']);
			expect(result).to.equal('/tmp/raspbian.img');
		});

		it('should extract compressed image', function () {
			const result = extractFileFromArgs(['spark', 'file.img.gz']);
			expect(result).to.equal('file.img.gz');
		});

		it('should skip flags', function () {
			const result = extractFileFromArgs(['spark', '--verbose', '--no-sandbox']);
			expect(result).to.be.null;
		});

		it('should return null for no file args', function () {
			const result = extractFileFromArgs(['spark']);
			expect(result).to.be.null;
		});

		it('should ignore non-image files', function () {
			const result = extractFileFromArgs(['spark', 'readme.txt']);
			expect(result).to.be.null;
		});
	});
});
