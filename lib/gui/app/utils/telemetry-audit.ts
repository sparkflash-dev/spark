/**
 * Telemetry audit — verify zero-telemetry promise.
 * Scans codebase for common telemetry patterns.
 */

export interface AuditResult {
  passed: boolean;
  findings: AuditFinding[];
  scannedFiles: number;
  timestamp: number;
}

export interface AuditFinding {
  type: 'analytics' | 'tracking' | 'phone-home' | 'fingerprint';
  severity: 'info' | 'warning' | 'critical';
  file: string;
  line: number;
  match: string;
  note: string;
}

export const TELEMETRY_PATTERNS = [
  { pattern: /google[\s-]?analytics|ga\s*\(/i, type: 'analytics' as const, note: 'Google Analytics reference' },
  { pattern: /mixpanel/i, type: 'analytics' as const, note: 'Mixpanel analytics' },
  { pattern: /sentry\.io|@sentry/i, type: 'tracking' as const, note: 'Sentry error tracking' },
  { pattern: /amplitude/i, type: 'analytics' as const, note: 'Amplitude analytics' },
  { pattern: /segment\.com|analytics\.js/i, type: 'analytics' as const, note: 'Segment analytics' },
  { pattern: /hotjar/i, type: 'tracking' as const, note: 'Hotjar tracking' },
  { pattern: /beacon.*send|navigator\.sendBeacon/i, type: 'phone-home' as const, note: 'Beacon API usage' },
  { pattern: /fingerprint(?:js|2)/i, type: 'fingerprint' as const, note: 'Browser fingerprinting' },
  { pattern: /telemetry.*enable|enable.*telemetry/i, type: 'tracking' as const, note: 'Telemetry toggle' },
  { pattern: /tracking[\s_-]?id|user[\s_-]?id.*track/i, type: 'tracking' as const, note: 'User tracking ID' },
];

export const WHITELISTED_CONTEXTS = [
  'telemetry-audit.ts', // This file itself
  'analytics-stub.ts',  // The stub that disables analytics
  'CHANGELOG.md',       // Mentions of removed telemetry
  'README.md',          // Privacy documentation
  '.spec.ts',           // Test files
];

export function isWhitelisted(filePath: string): boolean {
  return WHITELISTED_CONTEXTS.some((ctx) => filePath.includes(ctx));
}

export function formatAuditReport(result: AuditResult): string {
  if (result.passed) {
    return `✅ Telemetry audit PASSED — ${result.scannedFiles} files scanned, no telemetry found`;
  }

  const critical = result.findings.filter((f) => f.severity === 'critical');
  const warnings = result.findings.filter((f) => f.severity === 'warning');

  return [
    `❌ Telemetry audit FAILED — ${result.findings.length} findings`,
    ...critical.map((f) => `  CRITICAL: ${f.file}:${f.line} — ${f.note}`),
    ...warnings.map((f) => `  WARNING: ${f.file}:${f.line} — ${f.note}`),
  ].join('\n');
}
