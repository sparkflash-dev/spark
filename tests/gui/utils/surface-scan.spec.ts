import { expect } from 'chai';
import { SurfaceScanner, formatSectorAddress, getScanModes } from '../../../lib/gui/app/utils/surface-scan';

describe('SurfaceScanner', () => {
  let scanner: SurfaceScanner;

  beforeEach(() => {
    scanner = new SurfaceScanner(512);
  });

  it('should calculate total sectors', () => {
    const sectors = scanner.calculateTotalSectors(1024 * 1024); // 1 MB
    expect(sectors).to.equal(2048); // 1MB / 512B
  });

  it('should estimate scan duration', () => {
    const duration = scanner.estimateScanDuration(32 * 1024 * 1024 * 1024); // 32 GB
    expect(duration).to.be.greaterThan(0);
  });

  it('should format scan result', () => {
    const result = scanner.formatScanResult({
      totalSectors: 1000, badSectors: [], scannedSectors: 1000,
      duration: 5000, passed: true, speed: 200,
    });
    expect(result).to.include('passed');
  });

  it('should support cancellation', () => {
    expect(scanner.isCancelled()).to.be.false;
    scanner.cancel();
    expect(scanner.isCancelled()).to.be.true;
  });
});

describe('formatSectorAddress', () => {
  it('should format as hex', () => {
    expect(formatSectorAddress(255)).to.equal('0x000000FF');
    expect(formatSectorAddress(0)).to.equal('0x00000000');
  });
});

describe('getScanModes', () => {
  it('should return 3 modes', () => {
    const modes = getScanModes();
    expect(modes).to.have.length(3);
    expect(modes[0].name).to.equal('Quick');
  });
});
