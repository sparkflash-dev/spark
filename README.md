<div align="center">

# Spark

**The privacy-first USB flasher. Zero telemetry. Zero ads. Fully offline.**

[![Latest Release](https://img.shields.io/github/v/release/sparkflash-dev/spark?label=v3.4.0&color=%23f59e0b&style=for-the-badge&logo=github)](https://github.com/sparkflash-dev/spark/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/sparkflash-dev/spark/total?color=%231a1a2e&style=for-the-badge&logo=github)](https://github.com/sparkflash-dev/spark/releases/latest)
[![License](https://img.shields.io/badge/license-Apache--2.0-%2322c55e?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-%239a9ab0?style=for-the-badge&logo=electron)](https://github.com/sparkflash-dev/spark/releases/latest)
[![Languages](https://img.shields.io/badge/languages-15-%236366f1?style=for-the-badge)](https://github.com/sparkflash-dev/spark)

[**Download**](#install) · [**Features**](#features) · [**CLI**](#cli) · [**Build**](#build-from-source) · [**Roadmap**](#roadmap)

</div>

---

## What is Spark?

Spark is a cross-platform OS image flasher built for sysadmins and power users who flash drives daily. Forked from [balenaEtcher](https://github.com/balena-io/etcher) with **every line of telemetry, analytics, and marketing removed**. No network requests, no tracking, no ads — just a fast, reliable tool that works offline.

### Why Spark over Etcher or Rufus?

| | balenaEtcher | Rufus | **Spark** |
|--|:---:|:---:|:---:|
| Cross-platform | Linux/Win/Mac | Windows only | **Linux/Win/Mac** |
| Telemetry | Sentry + Mixpanel + GA | None | **None** |
| Marketing webviews | 64% of window | None | **None** |
| Works offline | Hangs on startup | Yes | **Yes** |
| CLI mode | No | No | **Yes** |
| Windows ISO support | No | Yes | **Yes** |
| Multi-boot USB | No | No | **Yes** |
| Drive backup/clone | No | No | **Yes** |
| Queue mode (batch) | No | No | **Yes** |
| Persistent storage | No | No | **Yes** |
| Plugin system | No | No | **Yes** |
| Post-flash scripts | No | No | **Yes** |
| SHA256 verification | No | No | **Auto-detect** |
| Drag & drop | No | No | **Yes** |
| Keyboard shortcuts | No | No | **12 shortcuts** |
| Localization | 3 languages | 40+ | **15 languages** |

---

## Features

<table>
<tr>
<td width="50%">

### Flash
- Flash `.img` `.iso` `.gz` `.xz` `.bz2` `.zst` `.zip` `.dmg` `.raw` and more
- **Multi-target** — write to multiple drives simultaneously
- **Queue mode** — flash same image to drives sequentially (insert next, auto-flash)
- **Multi-boot** — put multiple ISOs on one USB with GRUB boot menu
- **Byte-by-byte verification** after every flash
- **SHA256/MD5 checksum** — auto-detects sidecar files
- **Drive backup/clone** — create .img backups with gzip/zstd compression
- **Resume interrupted writes** — checkpoint recovery
- **Persistent storage** — casper-rw/overlay for Ubuntu, Fedora, Debian, Kali
- **Windows ISO** — auto-detect version, recommend MBR/GPT and boot mode
- **Network flash** — flash directly from HTTP/HTTPS URL with resume

</td>
<td width="50%">

### Experience
- **Modern dark UI** — deep navy theme, Inter font, glow effects
- **15 languages** — EN, ZH, RU, JA, KO, DE, FR, ES, IT, PT, AR, TR, PL, HI, VI
- **12 keyboard shortcuts** — Ctrl+O, Ctrl+D, Ctrl+Enter, F5, and more
- **Drag & drop** with visual feedback
- **High contrast themes** — dark and light for accessibility
- **Screen reader support** — ARIA labels, focus trap, reduced motion
- **Flash history** — dashboard with stats and CSV export
- **Image library** — bookmark ISOs with tags and search
- **Native notifications** — completion alerts with action buttons
- **System tray** — progress tooltip during flash
- **Taskbar progress** — OS-level progress indicator
- **Plugin system** — community extensions for custom workflows
- **Post-flash scripts** — inject SSH keys, set hostname, WiFi config
- **Portable mode** — run from USB, no installation needed

</td>
</tr>
</table>

### Security

Spark takes security seriously. No data ever leaves your machine.

- **Zero telemetry** — no analytics, no crash reports, no phone-home
- **Content Security Policy** — strict CSP prevents XSS
- **Context isolation** — renderer cannot access Node.js APIs
- **Sandbox enforcement** — all renderer processes sandboxed
- **IPC validation** — all Electron IPC channels validated
- **Input sanitization** — path traversal, SSRF, shell injection prevention
- **Privilege escalation** — OS-native elevation (pkexec/osascript/UAC)
- **Telemetry audit** — CI pipeline scans for tracking patterns on every push

---

## Install

### Windows

1. Download **[Spark Setup.exe](https://github.com/sparkflash-dev/spark/releases/latest)** from Releases
2. Run the installer
3. Launch **Spark** from the Start Menu

> Windows may show a SmartScreen warning — click **More info -> Run anyway**.

### Linux

```bash
# Debian / Ubuntu
sudo apt install ./spark_3.4.0_amd64.deb

# Portable (any distro)
unzip Spark-linux-x64-3.4.0.zip -d spark && cd spark && ./spark
```

### macOS

1. Download `.dmg` from [Releases](https://github.com/sparkflash-dev/spark/releases/latest)
2. Drag Spark to Applications
3. First launch: right-click -> **Open** (or run `xattr -cr /Applications/Spark.app`)

> Apple Silicon (M1/M2/M3/M4) is supported. If SD cards aren't detected, install Rosetta:
> `softwareupdate --install-rosetta`

[**All downloads ->**](https://github.com/sparkflash-dev/spark/releases/latest)

---

## CLI

Spark includes a headless CLI for scripting, CI/CD, and server environments.

```bash
# Flash an image
spark flash --image ubuntu-24.04.iso --drive /dev/sdb --verify

# List available drives
spark list

# Verify a flashed drive
spark verify ubuntu-24.04.iso /dev/sdb

# Backup a drive
spark backup /dev/sdb -o backup.img.gz -c gzip

# Queue mode — flash to multiple drives sequentially
spark queue --image ubuntu-24.04.iso --verify

# Show system info
spark info
```

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` / `Cmd+O` | Open image file |
| `Ctrl+D` / `Cmd+D` | Select drive |
| `Ctrl+Enter` / `Cmd+Enter` | Start flash |
| `Ctrl+Shift+V` / `Cmd+Shift+V` | Toggle verification |
| `Ctrl+Shift+T` / `Cmd+Shift+T` | Toggle dark/light theme |
| `Ctrl+,` / `Cmd+,` | Open settings |
| `Ctrl+=` / `Cmd+=` | Zoom in |
| `Ctrl+-` / `Cmd+-` | Zoom out |
| `Ctrl+0` / `Cmd+0` | Reset zoom |
| `F5` | Refresh drive list |
| `Escape` | Close dialog / cancel |
| `Ctrl+Q` / `Cmd+Q` | Quit |

---

## Build from source

**Requirements:** Node.js >= 20, npm, git

```bash
git clone https://github.com/sparkflash-dev/spark.git
cd spark
npm install
```

| Command | Description |
|---------|-------------|
| `npm start` | Dev mode with live reload |
| `npm test` | Run test suite (Mocha + Chai) |
| `npx electron-forge make` | Build installer for current platform |
| `npx electron-forge make --targets @electron-forge/maker-zip` | Portable ZIP |

> After pulling changes, run `rm -rf .webpack` before `npm start` to clear the cache.

---

## Architecture

```
lib/
├── cli/                # CLI (spark flash, spark list, spark backup, spark queue)
├── gui/
│   └── app/
│       ├── i18n/       # 15 locale files
│       ├── utils/      # 90+ utility modules
│       ├── components/ # React UI components
│       └── reducers/   # Redux state management
└── shared/             # Shared between GUI and CLI

tests/
└── gui/
    └── utils/          # 60+ test files (Mocha + Chai)
```

**Stack:** Electron 37 + React 17 + Redux 4 + styled-components + etcher-sdk 10

**Processes:** Main (spark.ts) | Renderer (React) | Sidecar (spark-util WebSocket)

---

## Roadmap

### Phase 1: Core (v2.x) — Done
- [x] Remove ALL telemetry, analytics, marketing webviews
- [x] Complete rebrand (logo, colors, strings, bundle ID)
- [x] Modern dark UI with Inter font
- [x] Keyboard shortcuts and drag & drop
- [x] zstd image support

### Phase 2: Reliability (v3.0) — Done
- [x] SHA256/MD5 checksum auto-verification
- [x] Human-readable error messages with suggestions
- [x] Cancel confirmation dialog
- [x] Fix Ubuntu 24.04 .deb install
- [x] Fix requestMetadata race condition

### Phase 3: Power features (v3.1-3.2) — Done
- [x] CLI mode (`spark flash`, `spark list`, `spark verify`)
- [x] 15 languages (EN, ZH, RU, JA, KO, DE, FR, ES, IT, PT, AR, TR, PL, HI, VI)
- [x] Windows ISO detection with partition and boot mode guidance
- [x] Persistent storage for Linux live USBs
- [x] Bad sector surface scan
- [x] Flash queue and history
- [x] Drive health analysis
- [x] Secure IPC, CSP, sandbox enforcement
- [x] 100+ unit tests

### Phase 4: Pro features (v3.3-3.4) — Done
- [x] Multi-boot USB (Ventoy-style, GRUB menu)
- [x] Drive backup/clone with compression
- [x] Queue mode for batch flashing
- [x] Image library with bookmarks and tags
- [x] Post-flash scripts (SSH keys, hostname, WiFi)
- [x] Plugin system with manifest validation
- [x] Network flash from URL with resume
- [x] Portable mode
- [x] Accessibility (ARIA, high contrast, reduced motion, focus trap)
- [x] Theme manager (dark/light)
- [x] Parallel verification, direct I/O, write resume
- [x] GitHub Actions CI with telemetry audit

### Phase 5: Polish (v4.0) — Next
- [ ] Bundle size reduction (target < 100 MB)
- [ ] Native Windows ISO flashing (full MBR/GPT write, not just detection)
- [ ] Silent background auto-updates from GitHub Releases
- [ ] File system formatting (FAT32, NTFS, ext4, exFAT)
- [ ] Drive-to-drive cloning UI
- [ ] Image download integration (fetch popular ISOs in-app)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Electron 38+ upgrade
- [ ] macOS notarization and code signing
- [ ] Snap / Flatpak / AppImage packaging
- [ ] Community plugin repository

---

## Contributing

Contributions welcome — bug fixes, translations, tests, features.

```bash
git checkout -b fix/my-bug-fix
npm test                # must pass
npx tsc --noEmit        # must pass
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## License

[Apache 2.0](LICENSE)

Original work (c) 2016-2023 [Balena Ltd](https://balena.io)
Modifications (c) 2024-2026 Spark contributors

---

<div align="center">

**[Back to top](#spark)**

</div>
