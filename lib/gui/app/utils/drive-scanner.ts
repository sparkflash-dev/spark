/**
 * Drive scanner with polling and change detection.
 * Watches for USB drive insertions/removals and emits events.
 */

import { EventEmitter } from 'events';

export interface ScannedDrive {
	device: string;
	description: string;
	size: number;
	mountpoints: Array<{ path: string; label?: string }>;
	isRemovable: boolean;
	isSystem: boolean;
	isReadOnly: boolean;
	busType: string;
}

export interface ScannerOptions {
	pollInterval?: number; // ms, default 2000
	includeSystemDrives?: boolean;
}

export class DriveScanner extends EventEmitter {
	private interval: ReturnType<typeof setInterval> | null = null;
	private previousDrives: Map<string, ScannedDrive> = new Map();
	private options: Required<ScannerOptions>;

	constructor(options: ScannerOptions = {}) {
		super();
		this.options = {
			pollInterval: options.pollInterval ?? 2000,
			includeSystemDrives: options.includeSystemDrives ?? false,
		};
	}

	/**
	 * Start scanning for drives.
	 */
	start(): void {
		if (this.interval) return;
		this.scan();
		this.interval = setInterval(() => this.scan(), this.options.pollInterval);
	}

	/**
	 * Stop scanning.
	 */
	stop(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	/**
	 * Perform a single scan and emit changes.
	 */
	private async scan(): Promise<void> {
		try {
			// In production, uses drivelist.list()
			const drives = await this.listDrives();
			const currentMap = new Map<string, ScannedDrive>();

			for (const drive of drives) {
				if (!this.options.includeSystemDrives && drive.isSystem) continue;
				currentMap.set(drive.device, drive);

				// Check for new drives
				if (!this.previousDrives.has(drive.device)) {
					this.emit('attach', drive);
				}
			}

			// Check for removed drives
			for (const [device, drive] of this.previousDrives) {
				if (!currentMap.has(device)) {
					this.emit('detach', drive);
				}
			}

			this.previousDrives = currentMap;
			this.emit('scan', Array.from(currentMap.values()));
		} catch (err) {
			this.emit('error', err);
		}
	}

	/**
	 * List available drives. Wraps drivelist for testability.
	 */
	private async listDrives(): Promise<ScannedDrive[]> {
		// Dynamic import to avoid bundling issues
		const drivelist = require('drivelist');
		const drives = await drivelist.list();
		return drives.map((d: any) => ({
			device: d.device,
			description: d.description || '',
			size: d.size || 0,
			mountpoints: d.mountpoints || [],
			isRemovable: d.isRemovable ?? false,
			isSystem: d.isSystem ?? false,
			isReadOnly: d.isReadOnly ?? false,
			busType: d.busType || 'UNKNOWN',
		}));
	}

	/**
	 * Get currently known drives.
	 */
	getDrives(): ScannedDrive[] {
		return Array.from(this.previousDrives.values());
	}
}
