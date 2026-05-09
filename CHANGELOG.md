# Changelog

All notable changes to Spark are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

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
