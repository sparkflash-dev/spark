/**
 * Flash Queue — manages a queue of images for sequential flash operations.
 * When enabled, users can add multiple images that will be flashed one after
 * another to the same target drive(s), without manual intervention between writes.
 */

export interface QueueItem {
	id: string;
	imagePath: string;
	imageName: string;
	imageSize?: number;
	status: 'pending' | 'flashing' | 'completed' | 'failed';
	error?: string;
	startedAt?: number;
	completedAt?: number;
}

export type QueueEventType =
	| 'item-added'
	| 'item-removed'
	| 'item-started'
	| 'item-completed'
	| 'item-failed'
	| 'queue-completed';

type QueueListener = (event: QueueEventType, item?: QueueItem) => void;

let nextId = 1;

class FlashQueue {
	private items: QueueItem[] = [];
	private listeners: QueueListener[] = [];
	private _active = false;

	/**
	 * Add an image to the queue.
	 */
	add(imagePath: string, imageName: string, imageSize?: number): QueueItem {
		const item: QueueItem = {
			id: String(nextId++),
			imagePath,
			imageName,
			imageSize,
			status: 'pending',
		};
		this.items.push(item);
		this.emit('item-added', item);
		return item;
	}

	/**
	 * Remove an item from the queue (only if pending).
	 */
	remove(id: string): boolean {
		const index = this.items.findIndex(
			(item) => item.id === id && item.status === 'pending',
		);
		if (index === -1) return false;
		const [removed] = this.items.splice(index, 1);
		this.emit('item-removed', removed);
		return true;
	}

	/**
	 * Get the current queue.
	 */
	getAll(): QueueItem[] {
		return [...this.items];
	}

	/**
	 * Get the number of pending items.
	 */
	pendingCount(): number {
		return this.items.filter((i) => i.status === 'pending').length;
	}

	/**
	 * Get the next pending item.
	 */
	getNext(): QueueItem | undefined {
		return this.items.find((i) => i.status === 'pending');
	}

	/**
	 * Mark an item as started.
	 */
	markStarted(id: string): void {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			item.status = 'flashing';
			item.startedAt = Date.now();
			this._active = true;
			this.emit('item-started', item);
		}
	}

	/**
	 * Mark an item as completed.
	 */
	markCompleted(id: string): void {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			item.status = 'completed';
			item.completedAt = Date.now();
			this.emit('item-completed', item);

			if (this.pendingCount() === 0) {
				this._active = false;
				this.emit('queue-completed');
			}
		}
	}

	/**
	 * Mark an item as failed.
	 */
	markFailed(id: string, error: string): void {
		const item = this.items.find((i) => i.id === id);
		if (item) {
			item.status = 'failed';
			item.error = error;
			item.completedAt = Date.now();
			this.emit('item-failed', item);

			if (this.pendingCount() === 0) {
				this._active = false;
				this.emit('queue-completed');
			}
		}
	}

	/**
	 * Is the queue actively processing?
	 */
	isActive(): boolean {
		return this._active;
	}

	/**
	 * Clear all items from the queue.
	 */
	clear(): void {
		this.items = [];
		this._active = false;
	}

	/**
	 * Get a summary of the queue status.
	 */
	summary(): {
		total: number;
		pending: number;
		completed: number;
		failed: number;
	} {
		return {
			total: this.items.length,
			pending: this.items.filter((i) => i.status === 'pending').length,
			completed: this.items.filter((i) => i.status === 'completed').length,
			failed: this.items.filter((i) => i.status === 'failed').length,
		};
	}

	/**
	 * Register an event listener.
	 */
	on(listener: QueueListener): () => void {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	private emit(event: QueueEventType, item?: QueueItem): void {
		for (const listener of this.listeners) {
			try {
				listener(event, item);
			} catch (err) {
				console.error('Flash queue listener error:', err);
			}
		}
	}
}

/** Singleton flash queue instance */
export const flashQueue = new FlashQueue();
