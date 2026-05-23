import { expect } from 'chai';
import { TELEMETRY_PATTERNS, isWhitelisted, formatAuditReport } from '../../../lib/gui/app/utils/telemetry-audit';

describe('Telemetry Audit', () => {
  it('should have telemetry patterns defined', () => {
    expect(TELEMETRY_PATTERNS).to.be.an('array');
    expect(TELEMETRY_PATTERNS.length).to.be.greaterThan(5);
  });

  it('should whitelist audit file itself', () => {
    expect(isWhitelisted('lib/gui/app/utils/telemetry-audit.ts')).to.be.true;
  });

  it('should whitelist test files', () => {
    expect(isWhitelisted('tests/telemetry.spec.ts')).to.be.true;
  });

  it('should not whitelist random source files', () => {
    expect(isWhitelisted('lib/gui/app/main.ts')).to.be.false;
  });

  it('should format passed report', () => {
    const report = formatAuditReport({ passed: true, findings: [], scannedFiles: 100, timestamp: Date.now() });
    expect(report).to.include('PASSED');
    expect(report).to.include('100');
  });

  it('should format failed report', () => {
    const report = formatAuditReport({
      passed: false,
      findings: [{ type: 'analytics', severity: 'critical', file: 'test.ts', line: 10, match: 'ga()', note: 'Google Analytics' }],
      scannedFiles: 50,
      timestamp: Date.now(),
    });
    expect(report).to.include('FAILED');
    expect(report).to.include('CRITICAL');
  });
});
