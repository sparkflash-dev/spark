import { expect } from 'chai';
import { detectDistro, calculateMaxPersistenceSize, getDefaultPersistenceConfig, formatPersistenceSize } from '../../../lib/gui/app/utils/persistence-config';

describe('Persistence Config', () => {
  it('should detect Ubuntu', () => {
    const distro = detectDistro('ubuntu-22.04-desktop-amd64.iso');
    expect(distro).to.not.be.null;
    expect(distro!.distro).to.equal('Ubuntu');
    expect(distro!.persistenceType).to.equal('casper');
  });

  it('should detect Fedora', () => {
    const distro = detectDistro('Fedora-Workstation-Live-x86_64-39.iso');
    expect(distro).to.not.be.null;
    expect(distro!.distro).to.equal('Fedora');
    expect(distro!.persistenceType).to.equal('overlay');
  });

  it('should detect Kali', () => {
    const distro = detectDistro('kali-linux-2024.1-live-amd64.iso');
    expect(distro).to.not.be.null;
    expect(distro!.persistenceType).to.equal('persistence');
  });

  it('should return null for unknown distro', () => {
    expect(detectDistro('some-random-image.img')).to.be.null;
  });

  it('should calculate max persistence size', () => {
    const driveSize = 32 * 1024 * 1024 * 1024; // 32 GB
    const imageSize = 4 * 1024 * 1024 * 1024;  // 4 GB
    const max = calculateMaxPersistenceSize(driveSize, imageSize, 80);
    expect(max).to.be.lessThanOrEqual(driveSize * 0.8);
    expect(max).to.be.lessThanOrEqual(driveSize - imageSize);
  });

  it('should format persistence size', () => {
    expect(formatPersistenceSize(4 * 1024 * 1024 * 1024)).to.equal('4.0 GB');
    expect(formatPersistenceSize(512 * 1024 * 1024)).to.equal('512 MB');
  });
});
