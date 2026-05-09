# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| Latest release | ✅ Yes |
| Older releases | ❌ No — please upgrade |

---

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report them privately:

1. Go to **[Security → Advisories](https://github.com/sparkflash-dev/spark/security/advisories/new)**
   on this repository and click "Report a vulnerability".
2. Or send an email to the maintainer listed in `package.json`.

Include:
- A description of the vulnerability
- Steps to reproduce
- The potential impact
- Suggested fix (if you have one)

You will receive a response within **7 days**. If the issue is confirmed, a patched release
will be published and you will be credited in the changelog (unless you prefer to stay anonymous).

---

## Scope

This project is a desktop Electron application that writes disk images to removable drives.

**In scope:**
- Privilege escalation beyond what is required to write to drives
- Code execution via crafted image files or filenames
- WebSocket message injection between renderer and sidecar process
- XSS in any UI component that renders user-controlled content

**Out of scope:**
- Social engineering attacks
- Physical access attacks
- Issues in `node_modules` dependencies — report those upstream

---

## Code signing

Release builds are **not code-signed** at this time (the project is community-maintained
and certificate costs are significant).

- **Windows** users will see a SmartScreen warning. This is expected.
  Click "More info → Run anyway".
- **macOS** users will see a Gatekeeper warning on first launch.
  Right-click the app → Open to proceed.

We recommend verifying the SHA-256 checksum published alongside each release
against the downloaded file:

```bash
# Linux / macOS
sha256sum spark_*.deb

# Windows (PowerShell)
Get-FileHash Spark-Setup-*.exe -Algorithm SHA256
```

Checksums are published in the GitHub Release notes.

---

## Security design notes

- The sidecar process communicates with the renderer via a **localhost WebSocket** only.
- All WebSocket messages are validated against a strict **type whitelist** — unknown
  message types are silently dropped.
- Environment variables are passed to the sidecar via the process `env` object,
  not via shell command construction.
- No data is ever sent to any remote server — the app operates fully offline.
