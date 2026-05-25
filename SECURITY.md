# Security Policy

## Reporting vulnerabilities

If you discover a security vulnerability in Spark, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email: david-burn-dev@proton.me
3. Include: description, steps to reproduce, impact assessment
4. We aim to respond within 48 hours and patch critical issues within 7 days

## Supported versions

| Version | Status |
|---------|--------|
| 3.4.x | Current — full support |
| 3.3.x | Security fixes only |
| < 3.3 | End of life |

## Security architecture

Spark implements defense-in-depth with multiple security layers:

### Privacy
- **Zero telemetry** — no analytics, no crash reports, no phone-home, no network requests
- **Offline-first** — the app never contacts any server unless the user explicitly downloads an image from URL
- **Telemetry audit** — CI pipeline scans every commit for known tracking patterns (GA, Mixpanel, Sentry, Amplitude, Segment, Hotjar, beacon API, fingerprinting) and fails the build if any are found

### Electron hardening
- **Context isolation** — `contextIsolation: true`, renderer has no access to Node.js APIs
- **Node integration disabled** — `nodeIntegration: false` in all renderer windows
- **Sandbox enforcement** — all renderer processes run in Chromium sandbox
- **Web security** — same-origin policy enforced, no insecure content allowed
- **Navigation lock** — prevents renderer from navigating to external URLs
- **Preload bridge** — only explicitly exposed APIs available via `contextBridge`

### IPC security
- **Channel allowlist** — only registered IPC channels are accepted
- **Sender validation** — IPC messages are verified against expected sender
- **Prototype pollution protection** — IPC payloads are sanitized

### Input validation
- **Path sanitization** — blocks directory traversal (`../`, null bytes)
- **Device path validation** — only allows valid `/dev/sdX`, `/dev/diskN`, `\\.\PhysicalDriveN` patterns
- **URL sanitization** — blocks `file://`, localhost, private IP ranges (SSRF prevention)
- **Shell escaping** — all shell arguments are properly escaped
- **Filename sanitization** — strips path separators, null bytes, leading dots
- **Volume label validation** — enforces length and character restrictions

### Content Security Policy
- `default-src 'self'`
- `script-src 'self'` (no unsafe-eval, no unsafe-inline)
- `object-src 'none'`
- `frame-src 'none'`
- Dynamic CSP builder with strict mode option and validation warnings

### Privilege management
- Uses OS-native elevation: `pkexec` (Linux), `osascript` (macOS), UAC (Windows)
- No persistent root/admin access — elevation is requested per-operation
- Write operations require explicit user confirmation

## Automated security checks

Every push to `main` triggers:

1. **Telemetry audit** — scans for analytics/tracking patterns
2. **TypeScript strict mode** — catches type-level security issues
3. **CSP validation** — checks for unsafe directives
4. **Input sanitizer tests** — verifies SSRF, path traversal, injection prevention
5. **IPC security tests** — verifies channel validation and sender verification

## Third-party dependencies

Spark inherits dependencies from balenaEtcher. Key dependencies:
- `electron` 37.x — Chromium-based runtime
- `etcher-sdk` 10.x — flash operations
- No analytics SDKs, no tracking libraries, no ad networks
