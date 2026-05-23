/**
 * Startup performance tracking — measure and optimize app launch time.
 */

export interface StartupMetrics {
  processStart: number;
  windowCreated: number;
  domReady: number;
  appReady: number;
  firstPaint: number;
  fullyLoaded: number;
  totalMs: number;
}

export class StartupTracker {
  private marks: Map<string, number> = new Map();

  mark(name: string): void {
    this.marks.set(name, Date.now());
  }

  getMark(name: string): number | undefined {
    return this.marks.get(name);
  }

  getElapsed(from: string, to: string): number | null {
    const start = this.marks.get(from);
    const end = this.marks.get(to);
    if (start === undefined || end === undefined) return null;
    return end - start;
  }

  getMetrics(): Partial<StartupMetrics> {
    const processStart = this.marks.get('process-start') || 0;
    return {
      processStart,
      windowCreated: this.marks.get('window-created'),
      domReady: this.marks.get('dom-ready'),
      appReady: this.marks.get('app-ready'),
      firstPaint: this.marks.get('first-paint'),
      fullyLoaded: this.marks.get('fully-loaded'),
      totalMs: this.getElapsed('process-start', 'fully-loaded') || undefined,
    };
  }

  getReport(): string {
    const metrics = this.getMetrics();
    const lines: string[] = ['Startup Performance:'];

    const steps = [
      ['Process → Window', 'process-start', 'window-created'],
      ['Window → DOM', 'window-created', 'dom-ready'],
      ['DOM → App Ready', 'dom-ready', 'app-ready'],
      ['App Ready → Paint', 'app-ready', 'first-paint'],
      ['Paint → Loaded', 'first-paint', 'fully-loaded'],
    ];

    for (const [label, from, to] of steps) {
      const elapsed = this.getElapsed(from, to);
      if (elapsed !== null) {
        const status = elapsed > 1000 ? '⚠️' : '✓';
        lines.push(`  ${status} ${label}: ${elapsed}ms`);
      }
    }

    if (metrics.totalMs) {
      lines.push(`  Total: ${metrics.totalMs}ms`);
    }

    return lines.join('\n');
  }
}

export function getStartupOptimizations(): string[] {
  return [
    'Defer SDK initialization until drive scan is needed',
    'Lazy-load locale files based on detected language',
    'Use V8 code cache for faster module loading',
    'Minimize IPC calls during startup',
    'Load UI before scanning for drives',
  ];
}
