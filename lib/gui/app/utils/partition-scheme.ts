/**
 * Partition scheme configuration for flash operations.
 * Supports MBR and GPT with automatic recommendation based on image type.
 */

export type PartitionScheme = 'mbr' | 'gpt' | 'auto';
export type BootMode = 'uefi' | 'legacy' | 'uefi-csm';
export type FileSystemType = 'fat32' | 'ntfs' | 'ext4' | 'exfat';

export interface PartitionConfig {
  scheme: PartitionScheme;
  bootMode: BootMode;
  fileSystem: FileSystemType;
  clusterSize?: number;
  label?: string;
}

const FAT32_MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4 GB
const FAT32_MAX_PARTITION_SIZE = 32 * 1024 * 1024 * 1024; // 32 GB practical limit

export function getDefaultConfig(): PartitionConfig {
  return {
    scheme: 'auto',
    bootMode: 'uefi',
    fileSystem: 'fat32',
    label: 'SPARK',
  };
}

export function recommendFileSystem(imageSize: number, isWindows: boolean): FileSystemType {
  if (isWindows) return 'ntfs';
  if (imageSize > FAT32_MAX_FILE_SIZE) return 'ntfs';
  return 'fat32';
}

export function recommendPartitionScheme(bootMode: BootMode): PartitionScheme {
  if (bootMode === 'legacy') return 'mbr';
  return 'gpt';
}

export function getClusterSizes(fs: FileSystemType): number[] {
  switch (fs) {
    case 'fat32': return [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
    case 'ntfs': return [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
    case 'ext4': return [1024, 2048, 4096];
    case 'exfat': return [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144];
    default: return [4096];
  }
}

export function validatePartitionConfig(config: PartitionConfig, driveSize: number): string[] {
  const errors: string[] = [];

  if (config.fileSystem === 'fat32' && driveSize > FAT32_MAX_PARTITION_SIZE * 2) {
    errors.push('FAT32 is not recommended for drives larger than 64 GB');
  }

  if (config.bootMode === 'uefi' && config.scheme === 'mbr') {
    errors.push('UEFI boot typically requires GPT partition scheme');
  }

  if (config.bootMode === 'legacy' && config.scheme === 'gpt') {
    errors.push('Legacy BIOS boot may not work with GPT on some systems');
  }

  if (config.label && config.label.length > 11 && config.fileSystem === 'fat32') {
    errors.push('FAT32 volume labels must be 11 characters or fewer');
  }

  return errors;
}
