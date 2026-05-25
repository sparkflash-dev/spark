# Contributing to Spark

Thanks for your interest in contributing! Spark is built by a small team and every contribution matters.

## Quick start

```bash
git clone https://github.com/sparkflash-dev/spark.git
cd spark
npm ci
npm start
```

## Project structure

```
lib/
├── cli/                # CLI tool (spark flash, spark list, spark backup, spark queue)
├── gui/
│   └── app/
│       ├── i18n/       # 15 locale files (en, zh-CN, zh-TW, ru, ja, ko, de, fr, es, it, pt, ar, tr, pl, hi, vi)
│       ├── utils/      # 90+ shared utility modules
│       ├── components/ # React UI components (styled-components)
│       └── reducers/   # Redux state management
└── shared/             # Code shared between GUI and CLI

tests/
└── gui/
    └── utils/          # 60+ unit test files (Mocha + Chai)
```

**Stack:** Electron 37 + React 17 + Redux 4 + styled-components + TypeScript + etcher-sdk 10

## Running tests

```bash
npm test                          # Run all tests
npm test -- --grep "Queue"        # Run specific tests
npm test -- --grep "Windows ISO"  # Run by feature name
```

## Code style

- TypeScript strict mode
- No telemetry, tracking, or analytics — ever (see Privacy Policy below)
- Follow existing patterns in `lib/gui/app/utils/`
- Every new utility should have a corresponding test in `tests/gui/utils/`

## Commit messages

Use [conventional commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `perf:` | Performance improvement |
| `test:` | Adding or updating tests |
| `docs:` | Documentation |
| `refactor:` | Code refactoring |
| `security:` | Security improvements |
| `ci:` | CI/CD changes |
| `chore:` | Maintenance |

## Adding a new locale

1. Create `lib/gui/app/i18n/<code>.ts` (copy `en.ts` as template)
2. Translate all strings
3. Register in `lib/gui/app/i18n.ts`:
   - Add `import` statement
   - Add to `supportedLocales` array
   - Add to `i18next.init` resources
4. Add locale alias in `lib/gui/app/utils/locale-fallback.ts` if needed

Currently supported: `en`, `zh-CN`, `zh-TW`, `ru`, `ja`, `ko`, `de`, `fr`, `es`, `it`, `pt`, `ar`, `tr`, `pl`, `hi`, `vi`

## Adding a new utility

1. Create `lib/gui/app/utils/<name>.ts` with JSDoc header
2. Export pure functions and/or classes
3. Create `tests/gui/utils/<name>.spec.ts` with Mocha + Chai tests
4. Run `npm test` to verify

## Privacy policy

Spark has a **strict zero-telemetry policy**. Any PR that introduces tracking,
analytics, data collection, or network requests that aren't user-initiated
will be rejected. The CI pipeline includes an automated telemetry audit that
scans for known analytics patterns (Google Analytics, Mixpanel, Sentry,
Amplitude, Segment, Hotjar, beacon API, fingerprinting).

## Submitting a PR

1. Fork the repo and create a feature branch
2. Make your changes
3. Run `npm test` and `npx tsc --noEmit`
4. Open a PR against `main` with a clear description
5. CI will run tests, lint, and the telemetry audit

## License

By contributing, you agree that your contributions will be licensed under
the [Apache-2.0 license](LICENSE).
