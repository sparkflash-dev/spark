import { expect } from 'chai';
import { FlashQueue } from '../../../lib/gui/app/utils/queue-mode';

describe('FlashQueue', () => {
  let queue: FlashQueue;

  beforeEach(() => {
    queue = new FlashQueue();
    queue.setImage('/tmp/test.iso');
  });

  it('should add drives to queue', () => {
    queue.addDrive('/dev/sdb', 'USB Drive 1');
    queue.addDrive('/dev/sdc', 'USB Drive 2');
    expect(queue.getQueue()).to.have.length(2);
  });

  it('should track stats', () => {
    const item = queue.addDrive('/dev/sdb', 'USB Drive 1');
    queue.markFlashing(item.id);
    queue.markCompleted(item.id);
    const stats = queue.getStats();
    expect(stats.completed).to.equal(1);
    expect(stats.total).to.equal(1);
  });

  it('should not remove flashing drive', () => {
    const item = queue.addDrive('/dev/sdb', 'USB Drive');
    queue.markFlashing(item.id);
    expect(queue.removeDrive(item.id)).to.be.false;
  });

  it('should emit ready-to-flash for next pending after completion', (done) => {
    const item1 = queue.addDrive('/dev/sdb', 'Drive 1');
    const item2 = queue.addDrive('/dev/sdc', 'Drive 2');
    queue.markFlashing(item1.id);
    queue.on('ready-to-flash', (item) => {
      expect(item.id).to.equal(item2.id);
      done();
    });
    queue.markCompleted(item1.id);
  });

  it('should clear completed items', () => {
    const item = queue.addDrive('/dev/sdb', 'Drive');
    queue.markFlashing(item.id);
    queue.markCompleted(item.id);
    queue.clearCompleted();
    expect(queue.getQueue()).to.have.length(0);
  });

  it('should track failed items', () => {
    const item = queue.addDrive('/dev/sdb', 'Drive');
    queue.markFlashing(item.id);
    queue.markFailed(item.id, 'Write error');
    expect(queue.getStats().failed).to.equal(1);
  });
});
