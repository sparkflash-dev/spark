import { expect } from 'chai';
import { calculateVerifyConfig, createSegments, getVerifyProgress, formatVerifyResult } from '../../../lib/gui/app/utils/parallel-verify';

describe('Parallel Verify', () => {
  it('should calculate verify config', () => {
    const config = calculateVerifyConfig(4 * 1024 * 1024 * 1024);
    expect(config.segmentCount).to.be.greaterThan(0);
    expect(config.concurrency).to.be.at.least(1);
  });

  it('should create segments covering total size', () => {
    const config = { segmentCount: 4, segmentSize: 1024, totalSize: 4096, concurrency: 2 };
    const segments = createSegments(config);
    expect(segments).to.have.length(4);
    expect(segments[0].startOffset).to.equal(0);
    expect(segments[3].endOffset).to.equal(4096);
  });

  it('should calculate progress', () => {
    const segments = [
      { id: 0, startOffset: 0, endOffset: 1000, status: 'passed' as const, bytesVerified: 1000 },
      { id: 1, startOffset: 1000, endOffset: 2000, status: 'verifying' as const, bytesVerified: 500 },
    ];
    const progress = getVerifyProgress(segments);
    expect(progress.totalVerified).to.equal(1500);
    expect(progress.percent).to.equal(75);
  });

  it('should format passed result', () => {
    const segments = [
      { id: 0, startOffset: 0, endOffset: 1000, status: 'passed' as const, bytesVerified: 1000 },
    ];
    expect(formatVerifyResult(segments)).to.include('passed');
  });
});
