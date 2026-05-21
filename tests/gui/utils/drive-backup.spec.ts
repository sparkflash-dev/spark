import { expect } from 'chai';
import { DriveBackup, DriveClone } from '../../../lib/gui/app/utils/drive-backup';

describe('DriveBackup', () => {
  let backup: DriveBackup;

  beforeEach(() => {
    backup = new DriveBackup();
  });

  it('should generate output filename', () => {
    const name = backup.generateOutputFilename('/dev/sdb', 'none');
    expect(name).to.include('spark_backup');
    expect(name).to.include('.img');
  });

  it('should generate compressed filename', () => {
    const name = backup.generateOutputFilename('/dev/sdb', 'gzip');
    expect(name).to.include('.img.gz');
  });

  it('should estimate compressed size', () => {
    const raw = backup.estimateBackupSize(1000000, 'none');
    const gz = backup.estimateBackupSize(1000000, 'gzip');
    const zst = backup.estimateBackupSize(1000000, 'zstd');
    expect(raw).to.equal(1000000);
    expect(gz).to.be.lessThan(raw);
    expect(zst).to.be.lessThan(gz);
  });

  it('should validate backup options', () => {
    const errors = backup.validateBackupOptions({ sourceDrive: '', outputPath: '' });
    expect(errors.length).to.be.greaterThan(0);
  });
});

describe('DriveClone', () => {
  it('should reject same source and target', () => {
    const clone = new DriveClone();
    const errors = clone.validateClone('/dev/sdb', '/dev/sdb');
    expect(errors).to.include('Source and target drives must be different');
  });
});
