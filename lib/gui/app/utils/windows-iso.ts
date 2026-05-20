/**
 * Windows ISO detection and configuration.
 * Detects Windows ISOs and provides appropriate flash settings.
 */

export interface WindowsIsoInfo {
  isWindowsIso: boolean;
  version?: string;
  architecture?: string;
  edition?: string;
  requiresNtfs: boolean;
  supportsUefi: boolean;
}

const WINDOWS_PATTERNS: Record<string, RegExp> = {
  'Windows 11': /Win11|Windows[\s_-]?11/i,
  'Windows 10': /Win10|Windows[\s_-]?10/i,
  'Windows 8.1': /Win8\.1|Windows[\s_-]?8\.1/i,
  'Windows 8': /Win8[^.]|Windows[\s_-]?8[^.]/i,
  'Windows 7': /Win7|Windows[\s_-]?7/i,
  'Windows Server 2022': /Server[\s_-]?2022/i,
  'Windows Server 2019': /Server[\s_-]?2019/i,
};

const ARCH_PATTERNS: Record<string, RegExp> = {
  'x64': /x64|amd64|64[\s_-]?bit/i,
  'x86': /x86|i386|32[\s_-]?bit/i,
  'arm64': /arm64|aarch64/i,
};

const EDITION_PATTERNS: Record<string, RegExp> = {
  'Pro': /\bPro\b/i,
  'Home': /\bHome\b/i,
  'Enterprise': /\bEnterprise\b|LTSC/i,
  'Education': /\bEducation\b/i,
  'Server Standard': /Standard/i,
  'Server Datacenter': /Datacenter/i,
};

export function detectWindowsIso(filename: string): WindowsIsoInfo {
  const base = filename.replace(/\.[^.]+$/, '');
  let version: string | undefined;
  let architecture: string | undefined;
  let edition: string | undefined;

  for (const [ver, pattern] of Object.entries(WINDOWS_PATTERNS)) {
    if (pattern.test(base)) {
      version = ver;
      break;
    }
  }

  if (!version) {
    return { isWindowsIso: false, requiresNtfs: false, supportsUefi: false };
  }

  for (const [arch, pattern] of Object.entries(ARCH_PATTERNS)) {
    if (pattern.test(base)) {
      architecture = arch;
      break;
    }
  }

  for (const [ed, pattern] of Object.entries(EDITION_PATTERNS)) {
    if (pattern.test(base)) {
      edition = ed;
      break;
    }
  }

  const supportsUefi = version !== 'Windows 7';
  const requiresNtfs = true;

  return { isWindowsIso: true, version, architecture, edition, requiresNtfs, supportsUefi };
}

export function getWindowsFlashRecommendation(info: WindowsIsoInfo): {
  partitionScheme: 'mbr' | 'gpt';
  fileSystem: 'ntfs' | 'fat32';
  bootMode: 'uefi' | 'legacy' | 'uefi-csm';
} {
  if (!info.isWindowsIso) {
    return { partitionScheme: 'gpt', fileSystem: 'fat32', bootMode: 'uefi' };
  }

  if (info.version === 'Windows 7') {
    return { partitionScheme: 'mbr', fileSystem: 'ntfs', bootMode: 'legacy' };
  }

  if (info.version?.includes('Windows 11')) {
    return { partitionScheme: 'gpt', fileSystem: 'ntfs', bootMode: 'uefi' };
  }

  return { partitionScheme: 'gpt', fileSystem: 'ntfs', bootMode: 'uefi-csm' };
}
