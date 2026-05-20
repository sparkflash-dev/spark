/**
 * Portable mode — detect if running from USB, store config alongside executable.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface PortableConfig {
  isPortable: boolean;
  configDir: string;
  dataDir: string;
  logsDir: string;
}

const PORTABLE_MARKER = '.spark-portable';

export function isPortableMode(): boolean {
  const exeDir = getExecutableDirectory();
  return fs.existsSync(path.join(exeDir, PORTABLE_MARKER));
}

export function getExecutableDirectory(): string {
  if (process.execPath) {
    return path.dirname(process.execPath);
  }
  return process.cwd();
}

export function getPortableConfig(): PortableConfig {
  const portable = isPortableMode();
  const baseDir = portable ? getExecutableDirectory() : os.homedir();

  if (portable) {
    const sparkDir = path.join(baseDir, '.spark-data');
    return {
      isPortable: true,
      configDir: path.join(sparkDir, 'config'),
      dataDir: path.join(sparkDir, 'data'),
      logsDir: path.join(sparkDir, 'logs'),
    };
  }

  return {
    isPortable: false,
    configDir: path.join(baseDir, '.config', 'spark'),
    dataDir: path.join(baseDir, '.local', 'share', 'spark'),
    logsDir: path.join(baseDir, '.local', 'share', 'spark', 'logs'),
  };
}

export function enablePortableMode(): void {
  const exeDir = getExecutableDirectory();
  const markerPath = path.join(exeDir, PORTABLE_MARKER);
  fs.writeFileSync(markerPath, `Spark portable mode enabled at ${new Date().toISOString()}\n`);

  // Create directories
  const config = getPortableConfig();
  for (const dir of [config.configDir, config.dataDir, config.logsDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export function disablePortableMode(): void {
  const markerPath = path.join(getExecutableDirectory(), PORTABLE_MARKER);
  if (fs.existsSync(markerPath)) {
    fs.unlinkSync(markerPath);
  }
}
