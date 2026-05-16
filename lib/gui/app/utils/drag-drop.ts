/**
 * Drag-and-drop handling for image files.
 * Validates dropped files and extracts image paths.
 */

const SUPPORTED_EXTENSIONS = new Set([
	'.img', '.iso', '.bin', '.raw', '.dmg', '.dsk',
	'.gz', '.bz2', '.xz', '.zip', '.zst',
	'.img.gz', '.img.bz2', '.img.xz', '.img.zst', '.img.zip',
	'.iso.gz', '.raw.gz', '.raw.xz',
]);

export interface DropResult {
	accepted: boolean;
	filePath?: string;
	fileName?: string;
	error?: string;
}

/**
 * Validate and process a file drop event.
 */
export function handleFileDrop(files: FileList | File[]): DropResult {
	const fileArray = Array.from(files);

	if (fileArray.length === 0) {
		return { accepted: false, error: 'No files dropped' };
	}

	if (fileArray.length > 1) {
		return { accepted: false, error: 'Only one file can be dropped at a time' };
	}

	const file = fileArray[0];
	const filePath = (file as any).path || file.name;

	if (!isAcceptedExtension(filePath)) {
		return {
			accepted: false,
			error: `Unsupported file type: ${getExtension(filePath)}`,
		};
	}

	return {
		accepted: true,
		filePath,
		fileName: file.name,
	};
}

/**
 * Check if a file extension is accepted.
 */
export function isAcceptedExtension(filePath: string): boolean {
	const lower = filePath.toLowerCase();
	for (const ext of SUPPORTED_EXTENSIONS) {
		if (lower.endsWith(ext)) return true;
	}
	return false;
}

/**
 * Get compound extension from filename.
 */
function getExtension(filePath: string): string {
	const parts = filePath.split('/').pop()?.split('.') || [];
	if (parts.length >= 3) {
		return '.' + parts.slice(-2).join('.');
	}
	return '.' + (parts.pop() || '');
}

/**
 * Setup drag-and-drop prevention on non-drop areas.
 * Prevents browser from opening the file.
 */
export function preventDefaultDrag(element: HTMLElement): void {
	element.addEventListener('dragover', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});
	element.addEventListener('drop', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});
}

/**
 * Get human-friendly list of accepted formats.
 */
export function getAcceptedFormats(): string {
	return '.img, .iso, .bin, .raw, .dmg, .dsk (+ compressed variants)';
}
