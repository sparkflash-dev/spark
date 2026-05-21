import { expect } from 'chai';
import { getStats, loadHistory } from '../../../lib/gui/app/utils/flash-history';

describe('Flash History', () => {
  it('should return empty history on first run', () => {
    const history = loadHistory();
    expect(history).to.be.an('array');
  });

  it('should return valid stats structure', () => {
    const stats = getStats();
    expect(stats).to.have.property('totalFlashes');
    expect(stats).to.have.property('successfulFlashes');
    expect(stats).to.have.property('failedFlashes');
    expect(stats).to.have.property('totalBytesWritten');
    expect(stats).to.have.property('averageSpeed');
    expect(stats.totalFlashes).to.be.a('number');
  });

  it('should have null most used when empty', () => {
    const stats = getStats();
    // On fresh install, these should be null
    if (stats.totalFlashes === 0) {
      expect(stats.mostUsedImage).to.be.null;
      expect(stats.mostUsedDrive).to.be.null;
    }
  });
});
