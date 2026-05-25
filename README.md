<div align="center">

# ⚡ Spark

**Flash OS images to SD cards & USB drives — fast, clean, zero telemetry.**

[![Latest Release](https://img.shields.io/github/v/release/sparkflash-dev/spark?label=v3.4.0&color=%23f59e0b&style=for-the-badge&logo=github)](https://github.com/sparkflash-dev/spark/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/sparkflash-dev/spark/total?color=%231a1a2e&style=for-the-badge&logo=github)](https://github.com/sparkflash-dev/spark/releases/latest)
[![License](https://img.shields.io/badge/license-Apache--2.0-%2322c55e?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-%239a9ab0?style=for-the-badge&logo=electron)](https://github.com/sparkflash-dev/spark/releases/latest)

[**Download**](#-install) · [**Features**](#-features) · [**Build**](#-build-from-source) · [**Contribute**](#-contributing)

</div>

---

## What is Spark?

Spark is a fork of [balenaEtcher](https://github.com/balena-io/etcher) with **all telemetry, marketing and auto-update pings completely removed**. It's built for sysadmins and power users who flash drives every day and want a tool that respects their privacy.

### Spark vs balenaEtcher

| | balenaEtcher | Spark |
|--|:---:|:---:|
| Sentry crash reporting | ✅ ON | ❌ Removed |
| Mixpanel analytics | ✅ ON | ❌ Removed |
| Marketing webview (64% of window) | ✅ Shown | ❌ Removed |
| Auto-update pinging home | ✅ Every 5 min | ❌ Removed |
| Works offline | ❌ Hangs | ✅ Fully offline |
| Ubuntu 24.04 `.deb` install | ❌ Broken | ✅ Fixed |
| Cancel confirmation | ❌ Instant | ✅ Asks first |
| SHA256 checksum verification | ❌ | ✅ Auto-detect |
| Keyboard shortcuts | ❌ | ✅ Ctrl+O, Ctrl+, |
| zstd image support | ❌ | ✅ |
| Modern dark UI | ❌ | ✅ |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### Core
- 🔥 Flash `.img` `.iso` `.gz` `.xz` `.bz2` `.zst` `.zip` and more
- 🎯 **Multi-target** — write to several drives at once
- ✅ Byte-for-byte **verification** after every flash
- 🔐 **SHA256 checksum** — auto-detects `.sha256sum` files
- 🗂️ **Drive cloning** — copy one drive to another
- ⚡ **Blockmapping** — skip empty blocks for faster writes

</td>
<td width="50%">

### Quality of life
- 🎨 **Modern dark theme** — deep navy with amber accents
- ⌨️ **Keyboard shortcuts** — Ctrl+O, Ctrl+,, Esc
- 🔇 **Zero network traffic** — fully offline
- 🔔 Desktop **notifications** on completion
- ⏱️ **Elapsed time** on the finish screen
- 🛡️ **Cancel dialog** prevents accidental abort
- ⚙️ **Rich settings** — 7 toggles organized in sections

</td>
</tr>
</table>

---

## 📥 Install

### Windows

1. Download **[Spark-3.0.0 Setup.exe](https://github.com/sparkflash-dev/spark/releases/latest)** from Releases
2. Run the installer
3. Launch **Spark** from the Start Menu

> Windows may show a SmartScreen warning for unsigned builds — click **More info → Run anyway**.

### Linux

```bash
# Debian / Ubuntu
sudo apt install ./spark_3.0.0_amd64.deb

# Portable (any distro)
unzip Spark-linux-x64-3.0.0.zip -d spark && cd spark && ./spark
```

### macOS

1. Download `.dmg` from [Releases](https://github.com/sparkflash-dev/spark/releases/latest)
2. Drag Spark to Applications
3. First launch: right-click → **Open** to bypass Gatekeeper

→ [**All downloads →**](https://github.com/sparkflash-dev/spark/releases/latest)

---

## ⌨️ Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` / `⌘O` | Open image file |
| `Ctrl+,` / `⌘,` | Open settings |
| `Esc` | Close dialog / settings |

---

## 🔧 Build from source

**Requirements:** Node.js ≥ 20, npm, git

```bash
git clone https://github.com/sparkflash-dev/spark.git
cd spark
npm install
```

| Command | What it does |
|---------|-------------|
| `npm start` | Dev mode with live reload |
| `npx electron-forge make` | Build installer for current platform |
| `npx electron-forge make --targets @electron-forge/maker-zip` | Portable ZIP only |

> **Tip:** After pulling new changes, run `rm -rf .webpack` before `npm start` to clear the webpack cache.

Output lands in `out/make/`.

---

## 🗺️ Roadmap

### ✅ Done (v2.1.4 → v3.0.0)
- [x] Remove all telemetry, analytics, marketing webviews
- [x] Complete rebrand — Spark logo, colors, all strings
- [x] Modern dark theme (deep navy `#1a1a2e`, amber/red accents, Inter font)
- [x] SHA256 checksum auto-verification from `.sha256sum` files
- [x] Improved error messages with troubleshooting tips
- [x] Keyboard shortcuts (Ctrl+O, Ctrl+,, Esc)
- [x] Expanded settings panel (7 options in 3 sections + shortcuts reference)
- [x] Cancel confirmation dialog
- [x] Elapsed time on finish screen
- [x] zstd / `.zst` image support
- [x] Fix Ubuntu 24.04 `.deb` install
- [x] Fix `requestMetadata` race condition (#4150)
- [x] WebSocket input validation & XSS fixes

### ✅ Done (v3.1.0-dev)
- [x] CLI mode — `spark flash --image ubuntu.iso --drive /dev/sdb`
- [x] Persistent storage detection for Linux live USBs (casper-rw)
- [x] Enhanced Windows ISO detection (version/edition, partition guidance)
- [x] Partition scheme & boot mode display (MBR/GPT, UEFI/Legacy)
- [x] Bad sector pre-write surface scan
- [x] Flash queue for sequential multi-image operations
- [x] Flash history (last 20 images with auto-pruning)
- [x] Drive health analysis (fake capacity, bus type, mountpoint warnings)
- [x] Auto-eject drive after successful flash
- [x] Localization — Russian, Japanese, Korean (6 languages total)
- [x] 64 new tests (checksum, Windows ISO, persistence, queue, drive health)

### 🔜 Next (v3.2+)
- [ ] Bundle size reduction (target < 100 MB)
- [ ] Faster writes — direct I/O, parallel verification
- [ ] Resume interrupted writes
- [ ] Native Windows ISO flashing (MBR/GPT, UEFI/Legacy)
- [ ] Drive backup / clone to `.img` file
- [ ] Multi-boot (Ventoy-style)
- [ ] Localization — German, French, Spanish

---

## 🤝 Contributing

Contributions welcome — bug fixes, translations, tests, features.

```bash
git checkout -b fix/my-bug-fix
# Make changes, then:
npx tsc --noEmit   # must pass
npm run prettify    # auto-format
# Open a pull request against main
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## 📜 License

[Apache 2.0](LICENSE)

Original work © 2016–2023 [Balena Ltd](https://balena.io)
Modifications © 2024–2026 Spark contributors

---

<div align="center">

**[⬆ Back to top](#-spark)**

Made with ⚡ by the Spark community

</div>
