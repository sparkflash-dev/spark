# Changelog

All notable changes to Spark are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased] — v3.1.0-dev

### Added
- **Russian localization** — complete Russian (ru) translation for all UI strings
- **Enhanced Windows ISO detection** — detects Win7–Win11, Server, Vista with version/edition parsing; improved warning with partition layout guidance
- **Partition & boot mode display** — image details modal now shows MBR/GPT scheme and UEFI/Legacy boot compatibility
- **Bad sector check** — optional pre-write surface scan setting to detect faulty drive sectors before writing
- **Flash queue** — queue manager for sequential multi-image flash operations with event system
- **CLI mode** — `spark flash --image <path> --drive <device>` headless flash with progress bar, `spark list` for drive enumeration
- **Persistent storage detection** — detects Ubuntu/Mint/Pop!_OS live ISOs and identifies casper-rw persistence support
- **55 new tests** — checksum verification (15), Windows ISO detection (12), persistent storage (11), flash queue (17)

### Changed
- Renamed main entry point `lib/gui/etcher.ts` → `lib/gui/spark.ts`
- Fixed `isStartScrpt()` typo → `isStartScript()` in forge.sidecar.ts
- Cleaned up stale TODO/FIXME comments across codebase
- Deleted unused balena.svg and etcher.svg assets
- Updated all remaining "Etcher" references in code comments
- Added missing cancel dialog translations to zh-CN and zh-TW

---

## [3.0.0] — 2026-05-12

### Added
- **New design** — deep navy dark theme (`#1a1a2e`), amber/red accent colors, Inter font stack
- **SHA256 checksum verification** — automatically detects `.sha256sum` / `.sha256` sidecar files and verifies image integrity with progress indicator
- **Improved error messages** — every flash error now includes human-readable troubleshooting tips
- **Keyboard shortcuts** — `Ctrl/Cmd+,` opens settings, `Escape` closes modals
- **New Spark logo** — lightning bolt gradient (amber → red) with glow effect

### Changed
- Complete rebranding: all `ETCHER_*` environment variables → `SPARK_*`
- `window.etcher` API → `window.spark`
- All UI strings updated across English, Chinese Simplified, and Chinese Traditional
- Progress bar colors: decompressing (amber), flashing (red), verifying (green)
- Linux install paths: `/opt/balenaEtcher/` → `/opt/Spark/`
- Switched typography from SourceSansPro to Inter system font stack

---

## [2.1.4] — 2026-05-04

This is the **first Spark release**, forked from balenaEtcher v2.1.4.

### Removed — telemetry & tracking
- Sentry SDK (`@sentry/electron`) — all crash reports, `captureException` calls and `initSentryMain()`
- `electron-updater` — auto-update mechanism and periodic version-check network requests
- `analytics.ts` Sentry/Mixpanel wiring (replaced with silent stubs)
- `initAnalytics()` call in the renderer entry point
- "Join the balena team" recruiting banner in the DevTools console

### Removed — marketing
- `efp.balena.io` featured-project webview displayed during flashing (occupied 64 % of the window)
- `efp.balena.io/success-banner` webview on the finish screen
- Analytics consent banner shown on every app launch
- UTM and referrer parameters on the logo link, menu items and settings changelog link
- Links to `etcher.io/pro` and `etcher.io` from the application menu

### Added
- **zstd / `.zst`** image format support
- **Cancel confirmation dialog** — prompts the user before aborting a running flash to prevent accidental drive corruption
- **Elapsed time** displayed on the finish screen after a successful flash
- `requestMetadataReady` Promise export — fixes a race condition where `requestMetadata` could be `undefined` when first called ([upstream #4150](https://github.com/balena-io/etcher/issues/4150))

### Fixed
- `.deb` package install failure on Ubuntu 24.04+ — removed `libgdk-pixbuf2.0-0` from host dependencies
- `errorReporting` and `updatesEnabled` settings now default to `false`
- WebSocket messages validated against a strict type whitelist on both the renderer and sidecar — unknown types are dropped
- `JSON.parse` calls on incoming WebSocket data wrapped in `try/catch` — malformed messages no longer crash the process
- Windows environment variable injection uses `execFile('cmd.exe', …)` instead of `exec()` to prevent shell injection
- `dangerouslySetInnerHTML` in the warning modal replaced with a safe renderer that allows only `http(s)://` anchor hrefs
- Silent error swallowing in `source-metadata.ts` — errors now propagate with a `console.error` log
- Node.js engines constraint relaxed from `>=20 <21` to `>=20` (adds Node 22 support)

### Changed
- App renamed from **balenaEtcher** to **Spark**
- Executable: `balena-etcher` → `spark`
- App protocol: `etcher://` → `spark://`
- Bundle ID: `io.balena.etcher` → `io.github.sparkflash-dev.spark`
- GitHub Actions CI workflow added (typecheck + lint on every push/PR)
- GitHub Actions release workflow added (cross-platform builds triggered by version tags)

---

*For the history prior to this fork see
[balenaEtcher releases](https://github.com/balena-io/etcher/releases).*
