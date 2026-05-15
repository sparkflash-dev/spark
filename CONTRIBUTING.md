# Contributing to Spark

Thank you for considering a contribution! Whether it's a bug fix, a new feature,
a translation, or just improving the docs — all help is appreciated.

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
- [Submitting a pull request](#submitting-a-pull-request)
- [Reporting bugs](#reporting-bugs)
- [Requesting features](#requesting-features)
- [Translations](#translations)

---

## Code of conduct

Be respectful. Constructive criticism is welcome; personal attacks are not.
Issues or PRs that are abusive will be closed without comment.

---

## Getting started

**Requirements:** Node.js ≥ 20, npm, git

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/spark.git
cd spark

# 2. Install dependencies
npm install          # also builds native addons

# Linux only — required for udev (USB detection):
sudo apt install libudev-dev     # Debian/Ubuntu
sudo dnf install systemd-devel   # Fedora

# 3. Start in dev mode (hot reload)
npm start
```

---

## Project structure

```
spark/
├── lib/
│   ├── gui/
│   │   ├── app/
│   │   │   ├── app.ts              # renderer entry point
│   │   │   ├── components/         # React components
│   │   │   ├── models/             # Redux store, state helpers
│   │   │   ├── modules/            # api.ts (IPC client), image-writer, …
│   │   │   ├── pages/              # main page, flash step
│   │   │   └── i18n/               # translation strings
│   │   └── spark.ts               # main process entry point
│   ├── util/
│   │   ├── api.ts                  # sidecar WebSocket server
│   │   ├── child-writer.ts         # etcher-sdk write wrapper
│   │   └── source-metadata.ts      # image metadata resolver
│   └── shared/                     # types and utilities shared by all processes
├── tests/                          # unit + e2e tests
├── forge.config.ts                 # Electron Forge build config
├── webpack.config.ts               # webpack config for main + renderer
└── .github/
    ├── workflows/                  # CI (ci.yml) and release (release.yml)
    └── ISSUE_TEMPLATE/             # structured issue forms
```

The app has **three processes**:

| Process | Entry | Role |
|---------|-------|------|
| Main | `lib/gui/spark.ts` | Electron main — window management, privilege elevation |
| Renderer | `lib/gui/app/app.ts` | React UI |
| Sidecar | `lib/util/api.ts` | Privileged child process — writes to drives via WebSocket |

---

## Development workflow

### Type-check

```bash
npx tsc --noEmit
```

All source files under `lib/` must pass with zero errors.

### Format

```bash
npm run prettify
```

Uses `balena-lint` (ESLint + Prettier). Run before every commit.

### Tests

```bash
# End-to-end (requires a display or xvfb-run on headless Linux):
npm run wdio

# On headless CI:
xvfb-run --auto-servernum npm run wdio
```

Unit tests live alongside e2e tests in `tests/`. Pure unit tests (no Electron) can be
run directly with mocha:

```bash
npx mocha --require ts-node/register tests/shared/*.spec.ts
```

### Running on a specific platform

The sidecar needs to run **elevated** to write to drives. In dev mode this is handled
automatically via `permissions.ts`. You can bypass it for UI work by setting:

```bash
SPARK_NO_SPAWN_UTIL=1 npm start
```

---

## Submitting a pull request

1. **One concern per PR.** Bug fix? One PR. New feature? Another PR.
2. **Branch off `main`**, name it descriptively: `fix/cancel-dialog`, `feat/zstd-support`.
3. **Type-check must pass**: `npx tsc --noEmit`
4. **Format before pushing**: `npm run prettify`
5. **Write a clear description** — what, why, how to test.
6. Reference the related issue if one exists: `Closes #123`.

PRs that fail CI will not be merged. Please fix the failures before requesting review.

---

## Reporting bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template.

Include:
- Spark version (shown in Settings → About)
- OS and architecture (e.g. Ubuntu 24.04 x64, Windows 11 ARM)
- Image filename and format
- Target drive (model, interface, size)
- Full error output from DevTools console (`Ctrl+Shift+I` / `Cmd+Opt+I`)

**Do not include** private file paths, passwords, or SSH keys in screenshots.

---

## Requesting features

Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template.

Describe:
- The **use case** — what problem you're solving, not just the solution
- How you currently work around it (if at all)
- Whether you'd be willing to implement it

---

## Translations

Translation strings live in `lib/gui/app/i18n/`.
Each file is a TypeScript object — copy `en.ts` as a template.

To add a new language:
1. Create `lib/gui/app/i18n/xx.ts` (using the ISO 639-1 code)
2. Register it in `lib/gui/app/i18n/i18n.ts`
3. Open a PR — translations don't require a separate issue

Existing translations: `en` `zh-CN` `zh-TW` (and others inherited from upstream).

---

## Questions?

Open a [Discussion](https://github.com/sparkflash-dev/spark/discussions) or an issue
with the `question` label.
