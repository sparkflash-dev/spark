import { expect } from 'chai';
import { isNewerVersion, getCurrentVersion } from '../../../lib/gui/app/utils/auto-update';

describe('Auto-update utilities', function () {
	describe('isNewerVersion()', function () {
		it('should detect newer major version', function () {
			expect(isNewerVersion('4.0.0', '3.1.0')).to.be.true;
		});

		it('should detect newer minor version', function () {
			expect(isNewerVersion('3.2.0', '3.1.0')).to.be.true;
		});

		it('should detect newer patch version', function () {
			expect(isNewerVersion('3.1.1', '3.1.0')).to.be.true;
		});

		it('should return false for same version', function () {
			expect(isNewerVersion('3.1.0', '3.1.0')).to.be.false;
		});

		it('should return false for older version', function () {
			expect(isNewerVersion('3.0.0', '3.1.0')).to.be.false;
		});

		it('should handle missing patch numbers', function () {
			expect(isNewerVersion('4.0', '3.1.0')).to.be.true;
		});
	});

	describe('getCurrentVersion()', function () {
		it('should return a valid semver string', function () {
			const version = getCurrentVersion();
			expect(version).to.match(/^\d+\.\d+\.\d+/);
		});
	});
});
