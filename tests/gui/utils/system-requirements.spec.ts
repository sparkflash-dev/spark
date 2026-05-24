import { expect } from 'chai';
import { checkSystemRequirements, formatRequirementsReport } from '../../../lib/gui/app/utils/system-requirements';

describe('System Requirements', () => {
  it('should return checks array', () => {
    const checks = checkSystemRequirements();
    expect(checks).to.be.an('array');
    expect(checks.length).to.be.at.least(3);
  });

  it('should check RAM', () => {
    const checks = checkSystemRequirements();
    const ram = checks.find((c) => c.name === 'RAM');
    expect(ram).to.not.be.undefined;
    expect(ram!.value).to.include('GB');
  });

  it('should check OS', () => {
    const checks = checkSystemRequirements();
    const osCheck = checks.find((c) => c.name === 'Operating System');
    expect(osCheck).to.not.be.undefined;
    expect(osCheck!.status).to.equal('pass');
  });

  it('should format report', () => {
    const checks = checkSystemRequirements();
    const report = formatRequirementsReport(checks);
    expect(report).to.include('System Requirements Check');
    expect(report).to.include('✓');
  });
});
