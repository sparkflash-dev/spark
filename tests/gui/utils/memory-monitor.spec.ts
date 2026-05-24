import { expect } from 'chai';
import { MemoryMonitor } from '../../../lib/gui/app/utils/memory-monitor';

describe('MemoryMonitor', () => {
  it('should take snapshots', () => {
    const monitor = new MemoryMonitor();
    const snap = monitor.snapshot();
    expect(snap.heapUsed).to.be.greaterThan(0);
    expect(snap.rss).to.be.greaterThan(0);
    expect(snap.percentUsed).to.be.greaterThan(0);
  });

  it('should return latest snapshot', () => {
    const monitor = new MemoryMonitor();
    expect(monitor.getLatest()).to.be.null;
    monitor.snapshot();
    expect(monitor.getLatest()).to.not.be.null;
  });

  it('should detect trend with enough data', () => {
    const monitor = new MemoryMonitor();
    for (let i = 0; i < 5; i++) monitor.snapshot();
    const trend = monitor.getTrend();
    expect(['increasing', 'stable', 'decreasing']).to.include(trend);
  });

  it('should return unknown trend with insufficient data', () => {
    const monitor = new MemoryMonitor();
    monitor.snapshot();
    expect(monitor.getTrend()).to.equal('unknown');
  });

  it('should format memory values', () => {
    const monitor = new MemoryMonitor();
    expect(monitor.formatMemory(1024 * 1024 * 100)).to.equal('100.0 MB');
  });

  it('should generate report', () => {
    const monitor = new MemoryMonitor();
    monitor.snapshot();
    const report = monitor.getReport();
    expect(report).to.include('Heap');
    expect(report).to.include('MB');
  });
});
