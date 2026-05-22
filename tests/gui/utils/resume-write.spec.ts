import { expect } from 'chai';
import { canResumeWrite, cleanupOldCheckpoints } from '../../../lib/gui/app/utils/resume-write';

describe('Resume Write', () => {
  it('should reject resume with different image', () => {
    const checkpoint = {
      imagePath: '/tmp/image-a.iso',
      driveDevice: '/dev/sdb',
      bytesWritten: 1000,
      totalBytes: 5000,
      imageChecksum: 'abc',
      timestamp: Date.now(),
      blockSize: 4096,
      lastVerifiedBlock: 10,
    };
    const result = canResumeWrite(checkpoint, '/tmp/image-b.iso');
    expect(result.canResume).to.be.false;
    expect(result.reason).to.include('Different image');
  });

  it('should allow resume with same image', () => {
    const checkpoint = {
      imagePath: '/tmp/image.iso',
      driveDevice: '/dev/sdb',
      bytesWritten: 1000,
      totalBytes: 50000,
      imageChecksum: 'abc',
      timestamp: Date.now(),
      blockSize: 4096,
      lastVerifiedBlock: 10,
    };
    const result = canResumeWrite(checkpoint, '/tmp/image.iso');
    expect(result.canResume).to.be.true;
    expect(result.resumeOffset).to.equal(40960);
  });

  it('should cleanup old checkpoints', () => {
    const cleaned = cleanupOldCheckpoints();
    expect(cleaned).to.be.a('number');
  });
});
