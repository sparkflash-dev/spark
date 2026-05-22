/**
 * Centralized error handler — user-friendly error messages with recovery suggestions.
 */

export interface SparkError {
  code: string;
  message: string;
  suggestion: string;
  severity: 'info' | 'warning' | 'error' | 'fatal';
  recoverable: boolean;
}

const ERROR_MAP: Record<string, Omit<SparkError, 'code'>> = {
  'EACCES': {
    message: 'Permission denied — cannot access the drive',
    suggestion: 'Try running Spark with administrator/root privileges',
    severity: 'error',
    recoverable: true,
  },
  'EBUSY': {
    message: 'Drive is busy — another process is using it',
    suggestion: 'Close any file managers or applications accessing the drive, then try again',
    severity: 'error',
    recoverable: true,
  },
  'ENOENT': {
    message: 'File or device not found',
    suggestion: 'Check that the image file exists and the drive is still connected',
    severity: 'error',
    recoverable: true,
  },
  'ENOSPC': {
    message: 'Not enough space on the drive',
    suggestion: 'Use a larger drive or a smaller image file',
    severity: 'error',
    recoverable: false,
  },
  'EIO': {
    message: 'I/O error — drive may be damaged or disconnected',
    suggestion: 'Check the USB connection, try a different port, or test with another drive',
    severity: 'fatal',
    recoverable: false,
  },
  'EPERM': {
    message: 'Operation not permitted',
    suggestion: 'The drive may be write-protected. Check the physical write-protect switch on the device',
    severity: 'error',
    recoverable: true,
  },
  'ENOMEM': {
    message: 'Out of memory',
    suggestion: 'Close other applications to free memory, or reduce the write buffer size in settings',
    severity: 'fatal',
    recoverable: false,
  },
  'ETIMEOUT': {
    message: 'Operation timed out',
    suggestion: 'The drive may be slow or unresponsive. Try reconnecting it',
    severity: 'warning',
    recoverable: true,
  },
  'CHECKSUM_MISMATCH': {
    message: 'Checksum verification failed — the image file may be corrupted',
    suggestion: 'Re-download the image file and verify its checksum before flashing',
    severity: 'error',
    recoverable: false,
  },
  'VERIFY_FAILED': {
    message: 'Post-flash verification failed — written data does not match source',
    suggestion: 'Try flashing again. If the issue persists, the drive may be defective',
    severity: 'error',
    recoverable: true,
  },
};

export function getSparkError(code: string): SparkError {
  const mapped = ERROR_MAP[code];
  if (mapped) {
    return { code, ...mapped };
  }
  return {
    code,
    message: `Unexpected error: ${code}`,
    suggestion: 'Check the log file for more details',
    severity: 'error',
    recoverable: false,
  };
}

export function formatErrorForUser(error: SparkError): string {
  return `${error.message}\n\n💡 ${error.suggestion}`;
}

export function isRetryable(code: string): boolean {
  const err = getSparkError(code);
  return err.recoverable;
}

export function getErrorIcon(severity: SparkError['severity']): string {
  switch (severity) {
    case 'info': return 'ℹ️';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    case 'fatal': return '💀';
  }
}
