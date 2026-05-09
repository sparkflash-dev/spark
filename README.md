<h1 align="center">Spark</h1>

<div align="center">

<p><strong>Flash OS images to SD cards & USB drives — fast, clean, zero telemetry.</strong></p>

<p>
  <a href="https://github.com/sparkflash-dev/spark/actions/workflows/ci.yml">
    <img src="https://github.com/sparkflash-dev/spark/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/sparkflash-dev/spark/releases/latest">
    <img src="https://img.shields.io/github/v/release/sparkflash-dev/spark?label=latest&color=brightgreen&logo=github" alt="Latest Release" />
  </a>
  <a href="https://github.com/sparkflash-dev/spark/releases/latest">
    <img src="https://img.shields.io/github/downloads/sparkflash-dev/spark/total?color=blue&logo=github" alt="Downloads" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-Apache--2.0-blue" alt="License" />
  </a>
  <a href="#install">
    <img src="https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey?logo=electron" alt="Platform" />
  </a>
</p>

<p>
  <a href="#install"><strong>Download</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#build-from-source"><strong>Build</strong></a> ·
  <a href="CONTRIBUTING.md"><strong>Contribute</strong></a>
</p>

<br />

> A fork of [balenaEtcher](https://github.com/balena-io/etcher) with all telemetry,
> marketing webviews and auto-update pings stripped out — plus a growing list of bug fixes
> and quality-of-life improvements aimed at sysadmins and power users.

</div>

---

## Why Spark?

<table>
<thead>
<tr>
  <th align="left">Feature</th>
  <th align="center">balenaEtcher</th>
  <th align="center">Spark</th>
</tr>
</thead>
<tbody>
<tr>
  <td>Sentry crash reporting (sends data to balena.io)</td>
  <td align="center">✅ ON by default</td>
  <td align="center">❌ removed</td>
</tr>
<tr>
  <td>Mixpanel / analytics SDK</td>
  <td align="center">✅ ON by default</td>
  <td align="center">❌ removed</td>
</tr>
<tr>
  <td>Marketing webview — occupies 64 % of window during flash</td>
  <td align="center">✅ always shown</td>
  <td align="center">❌ removed</td>
</tr>
<tr>
  <td>Analytics consent banner on every launch</td>
  <td align="center">✅</td>
  <td align="center">❌ removed</td>
</tr>
<tr>
  <td>Auto-update pinging home every 5 min</td>
  <td align="center">✅</td>
  <td align="center">❌ removed</td>
</tr>
<tr>
  <td>UTM / referrer links in menu and logo</td>
  <td align="center">✅</td>
  <td align="center">❌ removed</td>
</tr>
<tr>
  <td>Install on Ubuntu 24.04+ without errors</td>
  <td align="center">❌ broken <code>.deb</code></td>
  <td align="center">✅ fixed</td>
</tr>
<tr>
  <td>Works offline / behind a corporate firewall</td>
  <td align="center">❌ hangs at startup</td>
  <td align="center">✅ fully offline</td>
</tr>
<tr>
  <td>Cancel confirmation dialog (no accidental abort)</td>
  <td align="center">❌ instant cancel</td>
  <td align="center">✅ asks first</td>
</tr>
<tr>
  <td>Elapsed time shown on finish screen</td>
  <td align="center">❌</td>
  <td align="center">✅</td>
</tr>
<tr>
  <td>zstd / .zst image support</td>
  <td align="center">❌</td>
  <td align="center">✅</td>
</tr>
</tbody>
</table>

---

## Features

<table>
<tr>
<td width="50%">

**Core**
- 🔥 Flash `.img` `.iso` `.gz` `.xz` `.bz2` `.zst` `.zip` and more
- 🎯 Multi-target — write to several drives simultaneously
- ✅ Byte-for-byte **verification** after every flash
- 🗂️ **Drive cloning** — copy one drive to another
- ⚡ **Blockmapping** — skip empty blocks for faster writes
- 🔔 Desktop **notifications** on success or failure

</td>
<td width="50%">

**Quality of life**
- 🚫 **Zero network traffic** — works completely offline
- 🔒 Cancel dialog prevents accidental mid-flash abort
- ⏱️ Elapsed time displayed on the finish screen
- 🖥️ Cross-platform: Linux · Windows · macOS (Intel + Apple Silicon)
- 📦 `.deb` `.rpm` `.exe` `.dmg` release packages
- 🔑 Privilege elevation handled automatically

</td>
</tr>
</table>

---

## Install

### Linux

<details>
<summary><b>Debian / Ubuntu (recommended)</b></summary>

```bash
# Download the .deb from the Releases page, then:
sudo apt install ./spark_*.deb
```

Tested on: Ubuntu 20.04, 22.04, 24.04 · Debian 11, 12.

</details>

<details>
<summary><b>Fedora / RHEL / openSUSE</b></summary>

```bash
# Fedora / RHEL
sudo rpm -i spark-*.rpm

# openSUSE
sudo zypper install spark-*.rpm
```

</details>

<details>
<summary><b>Any distro — portable ZIP</b></summary>

```bash
unzip Spark-linux-x64-*.zip -d spark
cd spark
./spark   # no install needed, run as-is
```

</details>

→ [**All Linux downloads →**](https://github.com/sparkflash-dev/spark/releases/latest)

---

### Windows

1. Download **`Spark-Setup-*.exe`** from the [Releases page](https://github.com/sparkflash-dev/spark/releases/latest)
2. Run the installer — it handles everything, including driver setup
3. Launch **Spark** from the Start Menu

> **Note:** Windows may show a SmartScreen warning for unsigned builds.
> Click "More info → Run anyway". See [SECURITY.md](SECURITY.md) for details.

---

### macOS

1. Download **`Spark-*-x64.dmg`** (Intel) or **`Spark-*-arm64.dmg`** (Apple Silicon M1/M2/M3)  
   from the [Releases page](https://github.com/sparkflash-dev/spark/releases/latest)
2. Open the `.dmg` and drag Spark to Applications
3. First launch: right-click → Open to bypass Gatekeeper on unsigned builds

---

## Build from source

**Requirements:** Node.js ≥ 20, npm, git

```bash
git clone https://github.com/sparkflash-dev/spark.git
cd spark

# Linux only — native build dependency:
sudo apt install libudev-dev     # Debian/Ubuntu
sudo dnf install systemd-devel   # Fedora

npm install
```

| Command | What it does |
|---------|-------------|
| `npm start` | Dev mode with live reload |
| `npm run make` | Build installer for the current platform |
| `npm run package` | Package without creating installers |
| `npx tsc --noEmit` | Type-check without building |
| `npm run wdio` | Run end-to-end tests (needs display / xvfb) |

Output lands in `out/make/`.

---

## What changed from upstream

This fork tracks **balenaEtcher v2.1.4**.

<details>
<summary><b>Removed — telemetry & tracking</b></summary>

- `@sentry/electron` — SDK, `captureException` calls, `initSentryMain()`
- `electron-updater` — auto-update mechanism and all version-check network requests
- `analytics.ts` Sentry/Mixpanel wiring (replaced with no-op stubs so the module interface stays intact)
- `initAnalytics()` call in `app.ts`

</details>

<details>
<summary><b>Removed — marketing</b></summary>

- `efp.balena.io` featured-project webview shown during flashing (occupied 64 % of the window)
- `efp.balena.io/success-banner` webview on the finish screen
- Analytics consent banner shown on every launch
- UTM/referrer links on the logo (`?ref=etcher_footer`), menu (`utm_source=etcher_menu`), and settings changelog link
- "Join the team" recruiting `console.log` banner

</details>

<details>
<summary><b>Bug fixes</b></summary>

| Issue | Fix |
|-------|-----|
| [#4150](https://github.com/balena-io/etcher/issues/4150) | `requestMetadata` race condition on Arch/Fedora/NixOS — replaced polling loop with a `Promise`-based init |
| Ubuntu 24.04 `.deb` fails to install | Dropped `libgdk-pixbuf2.0-0` from `.deb` host dependencies |
| WebSocket messages not validated | Added whitelist of allowed message types on both server and client |
| Windows env vars set via `exec()` | Replaced with `execFile('cmd.exe', ...)` to prevent shell injection |
| XSS via `dangerouslySetInnerHTML` | Replaced with safe `renderMessageWithLinks()` that allows only `http(s)://` hrefs |
| Source metadata errors silently swallowed | Errors now propagate with proper logging |

</details>

<details>
<summary><b>New features</b></summary>

- **zstd / .zst** image support added to `SUPPORTED_EXTENSIONS`
- **Cancel confirmation dialog** — prompts before aborting a running flash
- **Elapsed time** on the finish screen
- Node.js engines constraint relaxed to `>=20` (allows v22+)

</details>

<details>
<summary><b>Renamed</b></summary>

| | Before | After |
|--|--------|-------|
| App protocol | `etcher://` | `spark://` |
| Executable | `balena-etcher` | `spark` |
| Bundle ID | `io.balena.etcher` | `io.github.sparkflash-dev.spark` |
| Product name | `balenaEtcher` | `Spark` |

</details>

---

## Roadmap

- [x] Remove all telemetry and marketing
- [x] Fix `requestMetadata` race condition (#4150)
- [x] Fix Ubuntu 24.04 `.deb` install
- [x] Add zstd support
- [x] Cancel confirmation dialog
- [x] Elapsed time on finish screen
- [x] WebSocket input validation & XSS fix
- [ ] Pre-flash image configuration (hostname, Wi-Fi, SSH key injection)
- [ ] Per-drive progress bars with resizable window
- [ ] Drive backup / clone to `.img` file
- [ ] Dark mode toggle
- [ ] Drag-and-drop image from browser

---

## Contributing

Contributions of all kinds are welcome — bug fixes, translations, tests, documentation.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

**Quick start:**

```bash
# Fork → clone → branch
git checkout -b fix/my-bug-fix

# Make changes, then:
npx tsc --noEmit   # must pass
npm run prettify   # auto-format

# Open a pull request against main
```

Please use the [bug report](.github/ISSUE_TEMPLATE/bug_report.md) or
[feature request](.github/ISSUE_TEMPLATE/feature_request.md) issue templates.

---

## Security

Found a vulnerability? Please read [SECURITY.md](SECURITY.md) before opening a public issue.

---

## License

[Apache 2.0](LICENSE)

Original work © 2016–2023 [Balena Ltd](https://balena.io)  
Modifications © 2026 sparkflash-dev contributors

---

<div align="center">

**[⬆ back to top](#spark)**

</div>
