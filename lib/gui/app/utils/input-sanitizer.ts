/**
 * Input sanitization — prevent injection attacks in user-provided values.
 */

export function sanitizeFilename(filename: string): string {
  // Remove null bytes and path separators
  return filename
    .replace(/\0/g, '')
    .replace(/[/\\]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .trim();
}

export function sanitizeDevicePath(devicePath: string): string | null {
  // Only allow valid device paths
  if (process.platform === 'win32') {
    if (/^\\\\.\\PhysicalDrive\d+$/i.test(devicePath)) return devicePath;
    if (/^[A-Z]:\\?$/i.test(devicePath)) return devicePath;
    return null;
  }

  // Linux/macOS: /dev/sdX, /dev/diskN, /dev/mmcblkN
  if (/^\/dev\/(sd[a-z]|disk\d+|mmcblk\d+|nvme\d+n\d+|loop\d+)$/.test(devicePath)) {
    return devicePath;
  }
  return null;
}

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    // Prevent SSRF to local addresses
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return null;
    }
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeLabel(label: string, maxLength = 11): string {
  return label
    .replace(/[^A-Za-z0-9_\- ]/g, '')
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>'";&|`$(){}[\]!#]/g, '')
    .trim()
    .slice(0, 200);
}

export function escapeForShell(arg: string): string {
  if (process.platform === 'win32') {
    return `"${arg.replace(/"/g, '""')}"`;
  }
  return `'${arg.replace(/'/g, "'\\''")}'`;
}
