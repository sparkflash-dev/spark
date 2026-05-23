import { expect } from 'chai';
import { BufferPool } from '../../../lib/gui/app/utils/buffer-pool';

describe('BufferPool', () => {
  it('should allocate buffers of correct size', () => {
    const pool = new BufferPool(4096, 4);
    const buf = pool.acquire();
    expect(buf.length).to.equal(4096);
    pool.release(buf);
  });

  it('should reuse released buffers', () => {
    const pool = new BufferPool(1024, 4);
    const buf1 = pool.acquire();
    pool.release(buf1);
    const buf2 = pool.acquire();
    expect(buf2).to.equal(buf1); // Same buffer instance
  });

  it('should track stats', () => {
    const pool = new BufferPool(512, 2);
    pool.acquire();
    const stats = pool.getStats();
    expect(stats.allocated).to.equal(1);
    expect(stats.reused).to.equal(0);
  });

  it('should drain pool', () => {
    const pool = new BufferPool(256, 8);
    const bufs = Array.from({ length: 5 }, () => pool.acquire());
    bufs.forEach((b) => pool.release(b));
    expect(pool.getStats().poolSize).to.equal(5);
    pool.drain();
    expect(pool.getStats().poolSize).to.equal(0);
  });

  it('should respect max pool size', () => {
    const pool = new BufferPool(256, 2);
    const bufs = Array.from({ length: 5 }, () => pool.acquire());
    bufs.forEach((b) => pool.release(b));
    expect(pool.getStats().poolSize).to.equal(2);
  });

  it('should calculate memory usage', () => {
    const pool = new BufferPool(1024, 4);
    const buf = pool.acquire();
    pool.release(buf);
    expect(pool.getMemoryUsage()).to.equal(1024);
  });
});
