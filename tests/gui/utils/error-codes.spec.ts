import { expect } from 'chai';
import {
	SparkErrorCode,
	getErrorInfo,
	classifyError,
} from '../../../lib/gui/app/utils/error-codes';

describe('Error codes utilities', function () {
	describe('getErrorInfo()', function () {
		it('should return info for FILE_NOT_FOUND', function () {
			const info = getErrorInfo(SparkErrorCode.FILE_NOT_FOUND);
			expect(info.title).to.equal('File Not Found');
			expect(info.recoverable).to.be.true;
			expect(info.suggestion).to.be.a('string');
		});

		it('should return info for DRIVE_DISCONNECTED', function () {
			const info = getErrorInfo(SparkErrorCode.DRIVE_DISCONNECTED);
			expect(info.title).to.equal('Drive Disconnected');
			expect(info.recoverable).to.be.false;
		});

		it('should return info for all error codes', function () {
			for (const code of Object.values(SparkErrorCode)) {
				const info = getErrorInfo(code);
				expect(info.title).to.be.a('string');
				expect(info.message).to.be.a('string');
				expect(info.recoverable).to.be.a('boolean');
			}
		});
	});

	describe('classifyError()', function () {
		it('should classify ENOENT as FILE_NOT_FOUND', function () {
			expect(classifyError(new Error('ENOENT: no such file'))).to.equal(SparkErrorCode.FILE_NOT_FOUND);
		});

		it('should classify EACCES as PERMISSION_DENIED', function () {
			expect(classifyError('EACCES: permission denied')).to.equal(SparkErrorCode.PERMISSION_DENIED);
		});

		it('should classify unplug as DRIVE_DISCONNECTED', function () {
			expect(classifyError('Drive was unplugged')).to.equal(SparkErrorCode.DRIVE_DISCONNECTED);
		});

		it('should classify ENOSPC as DRIVE_FULL', function () {
			expect(classifyError(new Error('ENOSPC: no space left'))).to.equal(SparkErrorCode.DRIVE_FULL);
		});

		it('should classify network errors', function () {
			expect(classifyError('ETIMEDOUT')).to.equal(SparkErrorCode.NETWORK_ERROR);
			expect(classifyError('ECONNREFUSED')).to.equal(SparkErrorCode.NETWORK_ERROR);
		});

		it('should classify checksum errors', function () {
			expect(classifyError('Checksum does not match')).to.equal(SparkErrorCode.CHECKSUM_MISMATCH);
		});

		it('should classify cancel', function () {
			expect(classifyError('Operation cancelled by user')).to.equal(SparkErrorCode.CANCELLED);
		});

		it('should return UNKNOWN for unrecognized errors', function () {
			expect(classifyError('something weird happened')).to.equal(SparkErrorCode.UNKNOWN);
		});
	});
});
