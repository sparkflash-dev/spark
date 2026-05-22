import { expect } from 'chai';
import { getSparkError, formatErrorForUser, isRetryable, getErrorIcon } from '../../../lib/gui/app/utils/error-handler';

describe('Error Handler', () => {
  it('should map EACCES to permission error', () => {
    const err = getSparkError('EACCES');
    expect(err.message).to.include('Permission');
    expect(err.suggestion).to.include('administrator');
    expect(err.recoverable).to.be.true;
  });

  it('should map EIO to I/O error', () => {
    const err = getSparkError('EIO');
    expect(err.severity).to.equal('fatal');
    expect(err.recoverable).to.be.false;
  });

  it('should handle unknown errors', () => {
    const err = getSparkError('UNKNOWN_CODE');
    expect(err.code).to.equal('UNKNOWN_CODE');
    expect(err.message).to.include('Unexpected');
  });

  it('should format error for user', () => {
    const err = getSparkError('ENOSPC');
    const formatted = formatErrorForUser(err);
    expect(formatted).to.include('space');
    expect(formatted).to.include('💡');
  });

  it('should identify retryable errors', () => {
    expect(isRetryable('EBUSY')).to.be.true;
    expect(isRetryable('EIO')).to.be.false;
  });

  it('should return correct icons', () => {
    expect(getErrorIcon('info')).to.equal('ℹ️');
    expect(getErrorIcon('fatal')).to.equal('💀');
  });
});
