import { expect } from 'chai';
import { getDefaultConfig, recommendFileSystem, recommendPartitionScheme, getClusterSizes, validatePartitionConfig } from '../../../lib/gui/app/utils/partition-scheme';

describe('Partition Scheme', () => {
  it('should return default config', () => {
    const config = getDefaultConfig();
    expect(config.scheme).to.equal('auto');
    expect(config.bootMode).to.equal('uefi');
    expect(config.fileSystem).to.equal('fat32');
  });

  it('should recommend NTFS for Windows', () => {
    expect(recommendFileSystem(1000, true)).to.equal('ntfs');
  });

  it('should recommend NTFS for large images', () => {
    const fiveGB = 5 * 1024 * 1024 * 1024;
    expect(recommendFileSystem(fiveGB, false)).to.equal('ntfs');
  });

  it('should recommend FAT32 for small non-Windows', () => {
    expect(recommendFileSystem(1000, false)).to.equal('fat32');
  });

  it('should recommend GPT for UEFI', () => {
    expect(recommendPartitionScheme('uefi')).to.equal('gpt');
  });

  it('should recommend MBR for legacy', () => {
    expect(recommendPartitionScheme('legacy')).to.equal('mbr');
  });

  it('should validate config warnings', () => {
    const errors = validatePartitionConfig({
      scheme: 'mbr', bootMode: 'uefi', fileSystem: 'fat32', label: 'SPARK',
    }, 16 * 1024 * 1024 * 1024);
    expect(errors.some((e) => e.includes('UEFI'))).to.be.true;
  });

  it('should return cluster sizes for all filesystems', () => {
    expect(getClusterSizes('fat32')).to.be.an('array').with.length.greaterThan(0);
    expect(getClusterSizes('ext4')).to.include(4096);
  });
});
