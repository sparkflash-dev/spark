# Changelog

All notable changes to Spark are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [3.1.0] — 2026-05-15

### Added
- **10 languages** — Russian, Japanese, Korean, German, French, Spanish, Italian, Portuguese localizations
- **Enhanced Windows ISO detection** — detects Win7–Win11, Server, Vista with version/edition parsing
- **Partition & boot mode display** — shows MBR/GPT scheme and UEFI/Legacy boot compatibility
- **Bad sector check** — optional pre-write surface scan setting
- **Flash queue** — sequential multi-image flash operations with event system
- **CLI mode** — `spark flash --image <path> --drive <device>` headless flash, `spark list` for drives
- **Persistent storage detection** — Ubuntu/Mint/Pop!_OS casper-rw persistence support
- **Flash history** — track last 20 flashed images with auto-pruning
- **Drive health analysis** — heuristic indicators for fake capacity, read-only, bus type
- **Auto-eject setting** — optionally eject drive after successful flash
- **Download manager** — fetch images from URL with progress tracking and redirect support
- **Recent images** — quick re-selection of recently used images
- **Progress calculator** — sliding window speed estimation with accurate ETA
- **Streaming hash** — compute SHA256/MD5/SHA512 without loading entire file into memory
- **Safe unmount/eject** — cross-platform drive unmount and eject utilities
- **Error codes** — standardized error classification with user-friendly messages
- **Platform helpers** — OS detection, elevation check, notification support
- **Theme tokens** — centralized design system (colors, spacing, typography)
- **Analytics stub** — zero-telemetry guarantee (no-op analytics interface)
- **Disk labels** — human-friendly drive names from metadata
- **Keyboard shortcuts** — centralized shortcut definitions and matching
- **File validation** — pre-flash checks (size, permissions, extension, freshness)
- **Accessibility** — ARIA labels, screen reader announcements
- **Desktop notifications** — flash/queue completion notifications
- **USB speed detection** — USB generation detection with time estimation
- **Config export/import** — backup and restore settings to JSON
- **Write speed logging** — historical performance tracking
- **Image format info** — compression detection and format analysis
- **100+ new tests** — comprehensive coverage for all new utilities

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
