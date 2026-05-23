/**
 * Memory monitor — track heap usage and warn before OOM.
 */

export interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  timestamp: number;
  percentUsed: number;
}

export class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots: number;
  private warningThreshold: number; // 0-1

  constructor(maxSnapshots = 100, warningThreshold = 0.85) {
    this.maxSnapshots = maxSnapshots;
    this.warningThreshold = warningThreshold;
  }

  snapshot(): MemorySnapshot {
    const mem = process.memoryUsage();
    const snap: MemorySnapshot = {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
      external: mem.external,
      timestamp: Date.now(),
      percentUsed: mem.heapUsed / mem.heapTotal,
    };

    this.snapshots.push(snap);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snap;
  }

  isMemoryPressure(): boolean {
    const latest = this.getLatest();
    if (!latest) return false;
    return latest.percentUsed > this.warningThreshold;
  }

  getLatest(): MemorySnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }

  getTrend(): 'increasing' | 'stable' | 'decreasing' | 'unknown' {
    if (this.snapshots.length < 5) return 'unknown';
    const recent = this.snapshots.slice(-5);
    const first = recent[0].heapUsed;
    const last = recent[recent.length - 1].heapUsed;
    const diff = (last - first) / first;
    if (diff > 0.1) return 'increasing';
    if (diff < -0.1) return 'decreasing';
    return 'stable';
  }

  formatMemory(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  getReport(): string {
    const snap = this.getLatest();
    if (!snap) return 'No memory data';
    const trend = this.getTrend();
    return [
      `Heap: ${this.formatMemory(snap.heapUsed)} / ${this.formatMemory(snap.heapTotal)} (${(snap.percentUsed * 100).toFixed(0)}%)`,
      `RSS: ${this.formatMemory(snap.rss)}`,
      `Trend: ${trend}`,
      this.isMemoryPressure() ? '⚠️ Memory pressure detected' : '',
    ].filter(Boolean).join('\n');
  }
}
