/**
 * Multi-drive simultaneous write support.
 * Manages parallel flash operations to multiple drives.
 */

import { EventEmitter } from 'events';

export interface WriteTarget {
	device: string;
	name: string;
	size: number;
}

export interface WriteProgress {
	device: string;
	phase: 'writing' | 'verifying' | 'done' | 'error';
	percentage: number;
	speed: number;
	error?: string;
}

export interface MultiWriteOptions {
	imagePath: string;
	targets: WriteTarget[];
	verify: boolean;
	onProgress?: (progress: WriteProgress[]) => void;
}

export class MultiWriteManager extends EventEmitter {
	private targets: WriteTarget[] = [];
	private activeWrites = new Map<string, WriteProgress>();
	private cancelled = false;

	constructor(options: MultiWriteOptions) {
		super();
		this.targets = options.targets;
		for (const target of this.targets) {
			this.activeWrites.set(target.device, {
				device: target.device,
				phase: 'writing',
				percentage: 0,
				speed: 0,
			});
		}
	}

	/**
	 * Start writing to all targets simultaneously.
	 */
	async start(): Promise<void> {
		this.emit('start', this.targets.length);
		// In production, this would spawn child writers per target
		// via etcher-sdk's multi-write support
	}

	/**
	 * Cancel all active writes.
	 */
	cancel(): void {
		this.cancelled = true;
		this.emit('cancelled');
	}

	/**
	 * Update progress for a specific device.
	 */
	updateProgress(device: string, progress: Partial<WriteProgress>): void {
		const current = this.activeWrites.get(device);
		if (current) {
			Object.assign(current, progress);
			this.emit('progress', Array.from(this.activeWrites.values()));
		}
	}

	/**
	 * Mark a device as complete.
	 */
	markComplete(device: string): void {
		this.updateProgress(device, { phase: 'done', percentage: 100 });
		this.checkAllComplete();
	}

	/**
	 * Mark a device as failed.
	 */
	markFailed(device: string, error: string): void {
		this.updateProgress(device, { phase: 'error', error });
		this.checkAllComplete();
	}

	/**
	 * Check if all writes are done.
	 */
	private checkAllComplete(): void {
		const all = Array.from(this.activeWrites.values());
		const done = all.every((w) => w.phase === 'done' || w.phase === 'error');
		if (done) {
			const failed = all.filter((w) => w.phase === 'error');
			this.emit('complete', {
				total: all.length,
				successful: all.length - failed.length,
				failed: failed.length,
			});
		}
	}

	/**
	 * Get current status of all writes.
	 */
	getStatus(): WriteProgress[] {
		return Array.from(this.activeWrites.values());
	}

	/**
	 * Check if any write is still in progress.
	 */
	isActive(): boolean {
		return Array.from(this.activeWrites.values()).some(
			(w) => w.phase === 'writing' || w.phase === 'verifying',
		);
	}
}
