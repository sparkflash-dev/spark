/**
 * Persistent storage configuration for Linux live USBs.
 * Supports Ubuntu casper-rw, Fedora overlay, and generic persistence.
 */

export interface PersistenceConfig {
  enabled: boolean;
  sizeBytes: number;
  type: PersistenceType;
  label: string;
  fileSystem: 'ext4' | 'fat32';
}

export type PersistenceType = 'casper' | 'overlay' | 'writable' | 'persistence' | 'none';

export interface DistroDetection {
  distro: string;
  persistenceType: PersistenceType;
  maxSizePercent: number;
  label: string;
  notes: string;
}

const DISTRO_PERSISTENCE: Record<string, DistroDetection> = {
  ubuntu: {
    distro: 'Ubuntu',
    persistenceType: 'casper',
    maxSizePercent: 80,
    label: 'casper-rw',
    notes: 'Creates casper-rw partition for persistent storage',
  },
  'linux-mint': {
    distro: 'Linux Mint',
    persistenceType: 'casper',
    maxSizePercent: 80,
    label: 'casper-rw',
    notes: 'Uses Ubuntu-style casper persistence',
  },
  fedora: {
    distro: 'Fedora',
    persistenceType: 'overlay',
    maxSizePercent: 50,
    label: 'OVERLAY',
    notes: 'Creates overlay partition (max 50% of drive recommended)',
  },
  debian: {
    distro: 'Debian',
    persistenceType: 'persistence',
    maxSizePercent: 80,
    label: 'persistence',
    notes: 'Creates persistence partition with persistence.conf',
  },
  kali: {
    distro: 'Kali Linux',
    persistenceType: 'persistence',
    maxSizePercent: 80,
    label: 'persistence',
    notes: 'Debian-style persistence, ideal for toolkit storage',
  },
  tails: {
    distro: 'Tails',
    persistenceType: 'persistence',
    maxSizePercent: 60,
    label: 'TailsData',
    notes: 'Tails manages its own encrypted persistence — use Tails installer instead',
  },
};

export function detectDistro(imageName: string): DistroDetection | null {
  const lower = imageName.toLowerCase();
  for (const [key, detection] of Object.entries(DISTRO_PERSISTENCE)) {
    if (lower.includes(key)) return detection;
  }
  return null;
}

export function calculateMaxPersistenceSize(driveSize: number, imageSize: number, maxPercent: number): number {
  const available = driveSize - imageSize;
  const maxByPercent = Math.floor(driveSize * (maxPercent / 100));
  return Math.min(available, maxByPercent);
}

export function getDefaultPersistenceConfig(imageName: string, driveSize: number, imageSize: number): PersistenceConfig {
  const distro = detectDistro(imageName);
  if (!distro || distro.persistenceType === 'none') {
    return { enabled: false, sizeBytes: 0, type: 'none', label: '', fileSystem: 'ext4' };
  }

  const maxSize = calculateMaxPersistenceSize(driveSize, imageSize, distro.maxSizePercent);
  const defaultSize = Math.min(maxSize, 4 * 1024 * 1024 * 1024); // default 4 GB

  return {
    enabled: false, // user must opt-in
    sizeBytes: defaultSize,
    type: distro.persistenceType,
    label: distro.label,
    fileSystem: 'ext4',
  };
}

export function formatPersistenceSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}
