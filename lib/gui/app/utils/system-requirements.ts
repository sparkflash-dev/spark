/**
 * System requirements checker — validate minimum specs for Spark.
 */

import * as os from 'os';

export interface SystemCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  value: string;
  required: string;
  message?: string;
}

export function checkSystemRequirements(): SystemCheck[] {
  const checks: SystemCheck[] = [];
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const cpuCount = os.cpus().length;
  const platform = os.platform();

  // RAM check
  const memGB = totalMem / (1024 * 1024 * 1024);
  checks.push({
    name: 'RAM',
    status: memGB >= 4 ? 'pass' : memGB >= 2 ? 'warn' : 'fail',
    value: `${memGB.toFixed(1)} GB`,
    required: '4 GB (2 GB minimum)',
    message: memGB < 2 ? 'Low memory may cause failures with large images' : undefined,
  });

  // Free RAM
  const freeGB = freeMem / (1024 * 1024 * 1024);
  checks.push({
    name: 'Free RAM',
    status: freeGB >= 1 ? 'pass' : freeGB >= 0.5 ? 'warn' : 'fail',
    value: `${freeGB.toFixed(1)} GB`,
    required: '1 GB free',
    message: freeGB < 0.5 ? 'Close other applications to free memory' : undefined,
  });

  // CPU
  checks.push({
    name: 'CPU cores',
    status: cpuCount >= 2 ? 'pass' : 'warn',
    value: `${cpuCount}`,
    required: '2+ cores',
  });

  // OS
  const supportedOS = ['linux', 'darwin', 'win32'];
  checks.push({
    name: 'Operating System',
    status: supportedOS.includes(platform) ? 'pass' : 'fail',
    value: `${platform} ${os.release()}`,
    required: 'Linux, macOS, or Windows',
  });

  // Disk space (temp dir)
  try {
    const tmpStats = require('fs').statfsSync(os.tmpdir());
    const tmpFreeGB = (tmpStats.bavail * tmpStats.bsize) / (1024 * 1024 * 1024);
    checks.push({
      name: 'Temp disk space',
      status: tmpFreeGB >= 5 ? 'pass' : tmpFreeGB >= 1 ? 'warn' : 'fail',
      value: `${tmpFreeGB.toFixed(1)} GB`,
      required: '5 GB free',
    });
  } catch {
    checks.push({
      name: 'Temp disk space',
      status: 'warn',
      value: 'Unknown',
      required: '5 GB free',
    });
  }

  return checks;
}

export function formatRequirementsReport(checks: SystemCheck[]): string {
  const lines = ['System Requirements Check:', ''];
  for (const check of checks) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '⚠' : '✗';
    lines.push(`  ${icon} ${check.name}: ${check.value} (need ${check.required})`);
    if (check.message) lines.push(`    → ${check.message}`);
  }
  const failed = checks.filter((c) => c.status === 'fail');
  if (failed.length > 0) {
    lines.push('', `${failed.length} check(s) failed — Spark may not work correctly`);
  } else {
    lines.push('', 'All checks passed');
  }
  return lines.join('\n');
}
