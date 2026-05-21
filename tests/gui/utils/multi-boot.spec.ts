import { expect } from 'chai';
import { detectImageType, canAddImage, generateGrubEntry, generateGrubConfig, createBootEntryId } from '../../../lib/gui/app/utils/multi-boot';

describe('Multi-boot', () => {
  it('should detect Linux images', () => {
    expect(detectImageType('ubuntu-22.04-desktop-amd64.iso')).to.equal('linux');
    expect(detectImageType('Fedora-Workstation-39.iso')).to.equal('linux');
  });

  it('should detect Windows images', () => {
    expect(detectImageType('Win11_23H2_English_x64.iso')).to.equal('windows');
    expect(detectImageType('Windows_10_Pro.iso')).to.equal('windows');
  });

  it('should detect utility images', () => {
    expect(detectImageType('memtest86-10.1.iso')).to.equal('utility');
    expect(detectImageType('gparted-live-1.5.0.iso')).to.equal('utility');
  });

  it('should check if image fits', () => {
    const driveSize = 32 * 1024 * 1024 * 1024; // 32 GB
    expect(canAddImage(driveSize, 0, 4 * 1024 * 1024 * 1024)).to.be.true;
    expect(canAddImage(driveSize, 31 * 1024 * 1024 * 1024, 2 * 1024 * 1024 * 1024)).to.be.false;
  });

  it('should generate GRUB entries', () => {
    const entry = { id: 'test', name: 'Ubuntu 22.04', isoPath: '/images/ubuntu.iso', isoSize: 0, type: 'linux' as const, addedAt: 0 };
    const grub = generateGrubEntry(entry);
    expect(grub).to.include('menuentry');
    expect(grub).to.include('Ubuntu 22.04');
  });

  it('should generate full GRUB config', () => {
    const entries = [
      { id: '1', name: 'Ubuntu', isoPath: '/images/ubuntu.iso', isoSize: 0, type: 'linux' as const, addedAt: 0 },
      { id: '2', name: 'Windows 11', isoPath: '/images/win11.iso', isoSize: 0, type: 'windows' as const, addedAt: 0 },
    ];
    const config = generateGrubConfig(entries);
    expect(config).to.include('set timeout=10');
    expect(config).to.include('Ubuntu');
    expect(config).to.include('Windows 11');
  });

  it('should generate unique IDs', () => {
    const id1 = createBootEntryId();
    const id2 = createBootEntryId();
    expect(id1).to.not.equal(id2);
  });
});
