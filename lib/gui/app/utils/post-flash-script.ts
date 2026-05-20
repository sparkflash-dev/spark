/**
 * Post-flash script runner — execute custom scripts after flashing.
 * Supports shell scripts, with timeout and output capture.
 */

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ScriptConfig {
  path: string;
  args?: string[];
  timeout?: number; // ms, default 30000
  env?: Record<string, string>;
  runAsRoot?: boolean;
}

export interface ScriptResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  timedOut: boolean;
}

export function validateScript(scriptPath: string): string[] {
  const errors: string[] = [];

  if (!fs.existsSync(scriptPath)) {
    errors.push(`Script not found: ${scriptPath}`);
    return errors;
  }

  const stats = fs.statSync(scriptPath);

  if (stats.isDirectory()) {
    errors.push('Path is a directory, not a script file');
    return errors;
  }

  // Check file extension
  const ext = path.extname(scriptPath).toLowerCase();
  const allowedExtensions = ['.sh', '.bash', '.ps1', '.bat', '.cmd', '.py'];
  if (ext && !allowedExtensions.includes(ext)) {
    errors.push(`Unsupported script type: ${ext}. Allowed: ${allowedExtensions.join(', ')}`);
  }

  // Check executable bit on Unix
  if (os.platform() !== 'win32') {
    try {
      fs.accessSync(scriptPath, fs.constants.X_OK);
    } catch {
      errors.push('Script is not executable. Run: chmod +x ' + scriptPath);
    }
  }

  // Check file size (sanity check)
  if (stats.size > 1024 * 1024) {
    errors.push('Script file is larger than 1 MB — this seems unusual');
  }

  return errors;
}

export function getScriptInterpreter(scriptPath: string): string {
  const ext = path.extname(scriptPath).toLowerCase();
  if (os.platform() === 'win32') {
    if (ext === '.ps1') return 'powershell.exe -ExecutionPolicy Bypass -File';
    if (ext === '.py') return 'python';
    return 'cmd.exe /c';
  }
  if (ext === '.py') return 'python3';
  return '/bin/bash';
}

export function buildScriptEnv(
  imagePath: string,
  driveDevice: string,
  flashResult: { success: boolean; bytesWritten: number; duration: number },
): Record<string, string> {
  return {
    SPARK_IMAGE_PATH: imagePath,
    SPARK_DRIVE_DEVICE: driveDevice,
    SPARK_FLASH_SUCCESS: flashResult.success ? '1' : '0',
    SPARK_BYTES_WRITTEN: String(flashResult.bytesWritten),
    SPARK_DURATION_MS: String(flashResult.duration),
    SPARK_VERSION: require('../../../package.json').version,
  };
}

export function getBuiltinScripts(): Array<{ name: string; description: string; filename: string }> {
  return [
    { name: 'Inject SSH Key', description: 'Copy SSH public key to authorized_keys on flashed drive', filename: 'inject-ssh-key.sh' },
    { name: 'Set Hostname', description: 'Change hostname on flashed Linux drive', filename: 'set-hostname.sh' },
    { name: 'Enable SSH', description: 'Create empty ssh file in boot partition (Raspberry Pi)', filename: 'enable-ssh-rpi.sh' },
    { name: 'WiFi Config', description: 'Write wpa_supplicant.conf for headless Raspberry Pi setup', filename: 'wifi-config-rpi.sh' },
  ];
}
