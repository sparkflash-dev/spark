# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in Spark, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email: david-burn-dev@proton.me
3. Include: description, steps to reproduce, impact assessment

We aim to respond within 48 hours and provide a fix within 7 days for critical issues.

## Security Features

Spark implements multiple layers of security:

- **Zero telemetry** — no data collection, no phone-home, no analytics
- **Content Security Policy** — strict CSP headers prevent XSS
- **IPC validation** — all Electron IPC channels are validated
- **Sandbox enforcement** — renderer process runs in sandbox
- **Input sanitization** — all user inputs are sanitized
- **Path traversal prevention** — file paths are validated
- **Privilege escalation** — uses OS-native elevation (pkexec/osascript/UAC)
- **Context isolation** — contextBridge API prevents prototype pollution

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.4.x   | ✅ Current |
| 3.3.x   | ✅ Security fixes |
| < 3.3   | ❌ EOL |

## Telemetry Audit

Every build runs an automated telemetry audit in CI. The audit scans for
known analytics/tracking patterns and fails the build if any are found.
