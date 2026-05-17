/**
 * Confirmation dialog logic.
 * Determines when and what confirmation dialogs to show.
 */

export interface ConfirmationCheck {
	needsConfirmation: boolean;
	title: string;
	message: string;
	severity: 'info' | 'warning' | 'danger';
}

interface FlashContext {
	imageName: string;
	imageSize: number;
	targetCount: number;
	targets: Array<{
		name: string;
		size: number;
		isSystem: boolean;
		mountpoints: string[];
	}>;
	isLargeTarget: boolean;
}

/**
 * Determine if confirmation is needed and generate dialog content.
 */
export function checkConfirmation(context: FlashContext): ConfirmationCheck {
	// System drive — always dangerous
	const systemTargets = context.targets.filter((t) => t.isSystem);
	if (systemTargets.length > 0) {
		return {
			needsConfirmation: true,
			title: 'System Drive Warning',
			message: `You are about to write to a SYSTEM DRIVE (${systemTargets.map((t) => t.name).join(', ')}). ` +
				'This will DESTROY your operating system. Are you absolutely sure?',
			severity: 'danger',
		};
	}

	// Mounted targets
	const mountedTargets = context.targets.filter((t) => t.mountpoints.length > 0);
	if (mountedTargets.length > 0) {
		const mounts = mountedTargets.flatMap((t) => t.mountpoints).join(', ');
		return {
			needsConfirmation: true,
			title: 'Mounted Drive',
			message: `Target has active mount points (${mounts}). ` +
				'All data will be erased. Continue?',
			severity: 'warning',
		};
	}

	// Large target drives (> 256 GB)
	const largeTargets = context.targets.filter((t) => t.size > 256 * 1024 * 1024 * 1024);
	if (largeTargets.length > 0) {
		return {
			needsConfirmation: true,
			title: 'Large Drive',
			message: `Target drive is ${formatGB(largeTargets[0].size)}. ` +
				'Make sure this is not a storage drive with important data.',
			severity: 'warning',
		};
	}

	// Multiple targets
	if (context.targetCount > 1) {
		return {
			needsConfirmation: true,
			title: 'Multiple Targets',
			message: `You are about to write ${context.imageName} to ${context.targetCount} drives simultaneously. ` +
				'All data on these drives will be erased.',
			severity: 'warning',
		};
	}

	// Default single-target confirmation
	return {
		needsConfirmation: true,
		title: 'Confirm Flash',
		message: `Write ${context.imageName} to ${context.targets[0]?.name || 'target'}? All existing data will be erased.`,
		severity: 'info',
	};
}

function formatGB(bytes: number): string {
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)} GB`;
}
