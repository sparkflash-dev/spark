import { expect } from 'chai';
import { getOptimalIOConfig, alignBuffer, estimateOptimalConcurrency, getIOSchedulerHint } from '../../../lib/gui/app/utils/direct-io';

describe('Direct I/O', () => {
  it('should return larger buffer for bigger drives', () => {
    const smallConfig = getOptimalIOConfig(4 * 1024 * 1024 * 1024);
    const largeConfig = getOptimalIOConfig(128 * 1024 * 1024 * 1024);
    expect(largeConfig.bufferSize).to.be.greaterThanOrEqual(smallConfig.bufferSize);
  });

  it('should align buffer to page boundary', () => {
    expect(alignBuffer(1000)).to.equal(4096);
    expect(alignBuffer(4096)).to.equal(4096);
    expect(alignBuffer(5000)).to.equal(8192);
  });

  it('should estimate concurrency based on CPUs', () => {
    const conc = estimateOptimalConcurrency();
    expect(conc).to.be.at.least(2);
    expect(conc).to.be.at.most(8);
  });

  it('should return scheduler hint for Linux', () => {
    const hint = getIOSchedulerHint('linux');
    expect(hint).to.include('scheduler');
  });
});
