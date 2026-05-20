/**
 * Queue mode — flash same image to multiple drives sequentially.
 * User inserts next drive → auto-flash begins.
 */

import { EventEmitter } from 'events';

export interface QueueItem {
  id: string;
  driveDevice: string;
  driveDescription: string;
  status: 'pending' | 'flashing' | 'verifying' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  bytesWritten: number;
}

export interface QueueStats {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  pending: number;
  totalBytesWritten: number;
  totalDuration: number;
  averageDuration: number;
}

export class FlashQueue extends EventEmitter {
  private queue: QueueItem[] = [];
  private imagePath: string = '';
  private autoFlash: boolean = true;
  private counter: number = 0;

  setImage(imagePath: string): void {
    this.imagePath = imagePath;
  }

  getImage(): string {
    return this.imagePath;
  }

  enableAutoFlash(enabled: boolean): void {
    this.autoFlash = enabled;
  }

  isAutoFlashEnabled(): boolean {
    return this.autoFlash;
  }

  addDrive(device: string, description: string): QueueItem {
    const item: QueueItem = {
      id: `queue-${++this.counter}`,
      driveDevice: device,
      driveDescription: description,
      status: 'pending',
      progress: 0,
      bytesWritten: 0,
    };
    this.queue.push(item);
    this.emit('drive-added', item);

    if (this.autoFlash && !this.hasActiveFlash()) {
      this.emit('ready-to-flash', item);
    }

    return item;
  }

  removeDrive(id: string): boolean {
    const idx = this.queue.findIndex((q) => q.id === id);
    if (idx === -1) return false;
    if (this.queue[idx].status === 'flashing') return false;
    this.queue.splice(idx, 1);
    return true;
  }

  updateProgress(id: string, progress: number, bytesWritten: number): void {
    const item = this.queue.find((q) => q.id === id);
    if (!item) return;
    item.progress = progress;
    item.bytesWritten = bytesWritten;
    this.emit('progress', item);
  }

  markFlashing(id: string): void {
    const item = this.queue.find((q) => q.id === id);
    if (!item) return;
    item.status = 'flashing';
    item.startTime = Date.now();
    this.emit('flashing', item);
  }

  markCompleted(id: string): void {
    const item = this.queue.find((q) => q.id === id);
    if (!item) return;
    item.status = 'completed';
    item.progress = 100;
    item.endTime = Date.now();
    this.emit('completed', item);

    const next = this.queue.find((q) => q.status === 'pending');
    if (next && this.autoFlash) {
      this.emit('ready-to-flash', next);
    }
  }

  markFailed(id: string, error: string): void {
    const item = this.queue.find((q) => q.id === id);
    if (!item) return;
    item.status = 'failed';
    item.error = error;
    item.endTime = Date.now();
    this.emit('failed', item);
  }

  hasActiveFlash(): boolean {
    return this.queue.some((q) => q.status === 'flashing' || q.status === 'verifying');
  }

  getStats(): QueueStats {
    const completed = this.queue.filter((q) => q.status === 'completed');
    const durations = completed
      .filter((q) => q.startTime && q.endTime)
      .map((q) => q.endTime! - q.startTime!);

    return {
      total: this.queue.length,
      completed: completed.length,
      failed: this.queue.filter((q) => q.status === 'failed').length,
      inProgress: this.queue.filter((q) => q.status === 'flashing' || q.status === 'verifying').length,
      pending: this.queue.filter((q) => q.status === 'pending').length,
      totalBytesWritten: this.queue.reduce((sum, q) => sum + q.bytesWritten, 0),
      totalDuration: durations.reduce((sum, d) => sum + d, 0),
      averageDuration: durations.length > 0 ? durations.reduce((s, d) => s + d, 0) / durations.length : 0,
    };
  }

  getQueue(): QueueItem[] {
    return [...this.queue];
  }

  clearCompleted(): void {
    this.queue = this.queue.filter((q) => q.status !== 'completed' && q.status !== 'failed');
  }

  reset(): void {
    this.queue = [];
    this.counter = 0;
    this.emit('reset');
  }
}
