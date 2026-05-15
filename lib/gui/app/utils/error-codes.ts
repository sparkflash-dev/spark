/**
 * Standardized error codes and user-friendly messages for Spark.
 * Maps internal error codes to actionable user messages.
 */

export enum SparkErrorCode {
	FILE_NOT_FOUND = 'FILE_NOT_FOUND',
	PERMISSION_DENIED = 'PERMISSION_DENIED',
	DRIVE_DISCONNECTED = 'DRIVE_DISCONNECTED',
	DRIVE_FULL = 'DRIVE_FULL',
	WRITE_FAILED = 'WRITE_FAILED',
	VERIFY_FAILED = 'VERIFY_FAILED',
	DECOMPRESS_FAILED = 'DECOMPRESS_FAILED',
	NETWORK_ERROR = 'NETWORK_ERROR',
	CHECKSUM_MISMATCH = 'CHECKSUM_MISMATCH',
	CANCELLED = 'CANCELLED',
	UNKNOWN = 'UNKNOWN',
}

interface ErrorInfo {
	code: SparkErrorCode;
	title: string;
	message: string;
	recoverable: boolean;
	suggestion?: string;
}

const ERROR_MAP: Record<SparkErrorCode, Omit<ErrorInfo, 'code'>> = {
	[SparkErrorCode.FILE_NOT_FOUND]: {
		title: 'File Not Found',
		message: 'The selected image file could not be found.',
		recoverable: true,
		suggestion: 'Select a different file or check that the file has not been moved.',
	},
	[SparkErrorCode.PERMISSION_DENIED]: {
		title: 'Permission Denied',
		message: 'Spark does not have permission to access this resource.',
		recoverable: true,
		suggestion: 'Try running Spark with elevated privileges.',
	},
	[SparkErrorCode.DRIVE_DISCONNECTED]: {
		title: 'Drive Disconnected',
		message: 'The target drive was disconnected during the operation.',
		recoverable: false,
		suggestion: 'Reconnect the drive and try again. Use a different USB port if the issue persists.',
	},
	[SparkErrorCode.DRIVE_FULL]: {
		title: 'Insufficient Space',
		message: 'The target drive does not have enough space for this image.',
		recoverable: true,
		suggestion: 'Use a larger drive.',
	},
	[SparkErrorCode.WRITE_FAILED]: {
		title: 'Write Failed',
		message: 'An error occurred while writing data to the drive.',
		recoverable: false,
		suggestion: 'The drive may be damaged. Try a different drive or USB port.',
	},
	[SparkErrorCode.VERIFY_FAILED]: {
		title: 'Verification Failed',
		message: 'The written data does not match the source image.',
		recoverable: false,
		suggestion: 'Try writing again. If the issue persists, the drive may be defective.',
	},
	[SparkErrorCode.DECOMPRESS_FAILED]: {
		title: 'Decompression Failed',
		message: 'The compressed image could not be decompressed.',
		recoverable: true,
		suggestion: 'The archive may be corrupted. Re-download the image and try again.',
	},
	[SparkErrorCode.NETWORK_ERROR]: {
		title: 'Network Error',
		message: 'A network error occurred while downloading the image.',
		recoverable: true,
		suggestion: 'Check your internet connection and try again.',
	},
	[SparkErrorCode.CHECKSUM_MISMATCH]: {
		title: 'Checksum Mismatch',
		message: 'The file checksum does not match the expected value.',
		recoverable: true,
		suggestion: 'The file may be corrupted. Re-download and verify the checksum.',
	},
	[SparkErrorCode.CANCELLED]: {
		title: 'Operation Cancelled',
		message: 'The operation was cancelled by the user.',
		recoverable: true,
	},
	[SparkErrorCode.UNKNOWN]: {
		title: 'Unknown Error',
		message: 'An unexpected error occurred.',
		recoverable: false,
		suggestion: 'Please report this issue on our GitHub page.',
	},
};

/**
 * Get structured error info from a SparkErrorCode.
 */
export function getErrorInfo(code: SparkErrorCode): ErrorInfo {
	const info = ERROR_MAP[code] || ERROR_MAP[SparkErrorCode.UNKNOWN];
	return { code, ...info };
}

/**
 * Classify a raw error into a SparkErrorCode.
 */
export function classifyError(error: Error | string): SparkErrorCode {
	const msg = typeof error === 'string' ? error : error.message;
	const lower = msg.toLowerCase();

	if (lower.includes('enoent') || lower.includes('not found')) return SparkErrorCode.FILE_NOT_FOUND;
	if (lower.includes('eacces') || lower.includes('permission')) return SparkErrorCode.PERMISSION_DENIED;
	if (lower.includes('unplug') || lower.includes('disconnect')) return SparkErrorCode.DRIVE_DISCONNECTED;
	if (lower.includes('no space') || lower.includes('enospc')) return SparkErrorCode.DRIVE_FULL;
	if (lower.includes('eio') || lower.includes('write error')) return SparkErrorCode.WRITE_FAILED;
	if (lower.includes('verification') || lower.includes('mismatch')) return SparkErrorCode.VERIFY_FAILED;
	if (lower.includes('decompress') || lower.includes('corrupt')) return SparkErrorCode.DECOMPRESS_FAILED;
	if (lower.includes('network') || lower.includes('etimedout') || lower.includes('econnrefused')) return SparkErrorCode.NETWORK_ERROR;
	if (lower.includes('checksum')) return SparkErrorCode.CHECKSUM_MISMATCH;
	if (lower.includes('cancel')) return SparkErrorCode.CANCELLED;

	return SparkErrorCode.UNKNOWN;
}
