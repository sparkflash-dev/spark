/**
 * Buffer pool — reuse allocated buffers to prevent GC pressure during writes.
 */

export class BufferPool {
  private pool: Buffer[] = [];
  private bufferSize: number;
  private maxPoolSize: number;
  private allocated: number = 0;
  private reused: number = 0;

  constructor(bufferSize: number, maxPoolSize = 16) {
    this.bufferSize = bufferSize;
    this.maxPoolSize = maxPoolSize;
  }

  acquire(): Buffer {
    const buf = this.pool.pop();
    if (buf) {
      this.reused++;
      buf.fill(0);
      return buf;
    }
    this.allocated++;
    return Buffer.alloc(this.bufferSize);
  }

  release(buf: Buffer): void {
    if (buf.length !== this.bufferSize) return;
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(buf);
    }
    // else: let GC collect it
  }

  drain(): void {
    this.pool.length = 0;
  }

  getStats(): { poolSize: number; allocated: number; reused: number; hitRate: number } {
    const total = this.allocated + this.reused;
    return {
      poolSize: this.pool.length,
      allocated: this.allocated,
      reused: this.reused,
      hitRate: total > 0 ? this.reused / total : 0,
    };
  }

  getBufferSize(): number {
    return this.bufferSize;
  }

  getMemoryUsage(): number {
    return this.pool.length * this.bufferSize;
  }
}
