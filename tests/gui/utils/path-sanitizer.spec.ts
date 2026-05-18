import { expect } from 'chai';
import {
	sanitizePath,
	isWithinDirectory,
	isPathSafe,
	getSafeDisplayName,
	validateImagePath,
} from '../../../lib/gui/app/utils/path-sanitizer';

describe('Path sanitization', function () {
	describe('sanitizePath()', function () {
		it('should resolve to absolute path', function () {
			const result = sanitizePath('/tmp/test.iso');
			expect(result).to.equal('/tmp/test.iso');
		});

		it('should remove null bytes', function () {
			const result = sanitizePath('/tmp/test\0.iso');
			expect(result).to.not.include('\0');
		});
	});

	describe('isWithinDirectory()', function () {
		it('should allow paths within directory', function () {
			expect(isWithinDirectory('/tmp/spark/image.iso', '/tmp/spark')).to.be.true;
		});

		it('should reject paths outside directory', function () {
			expect(isWithinDirectory('/etc/passwd', '/tmp/spark')).to.be.false;
		});

		it('should reject traversal attempts', function () {
			expect(isWithinDirectory('/tmp/spark/../../etc/passwd', '/tmp/spark')).to.be.false;
		});
	});

	describe('isPathSafe()', function () {
		it('should accept normal paths', function () {
			expect(isPathSafe('/home/user/ubuntu.iso')).to.be.true;
		});

		it('should reject path traversal', function () {
			expect(isPathSafe('../../../etc/passwd')).to.be.false;
		});

		it('should reject null bytes', function () {
			expect(isPathSafe('/tmp/test\0.iso')).to.be.false;
		});

		it('should reject command injection chars', function () {
			expect(isPathSafe('/tmp/test; rm -rf /')).to.be.false;
			expect(isPathSafe('/tmp/test | cat /etc/passwd')).to.be.false;
		});
	});

	describe('getSafeDisplayName()', function () {
		it('should return basename only', function () {
			expect(getSafeDisplayName('/tmp/secret/path/ubuntu.iso')).to.equal('ubuntu.iso');
		});
	});

	describe('validateImagePath()', function () {
		it('should accept valid path', function () {
			expect(validateImagePath('/tmp/test.iso').valid).to.be.true;
		});

		it('should reject empty path', function () {
			expect(validateImagePath('').valid).to.be.false;
		});

		it('should reject null bytes', function () {
			expect(validateImagePath('/tmp\0/test').valid).to.be.false;
		});

		it('should reject traversal', function () {
			expect(validateImagePath('../secret').valid).to.be.false;
		});
	});
});
