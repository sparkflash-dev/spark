# Contributing to Spark

Thanks for your interest in contributing to Spark! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/sparkflash-dev/spark.git
cd spark
npm ci
npm start
```

## Project Structure

```
lib/
├── cli/            # CLI tool (spark-cli.ts)
├── gui/
│   └── app/
│       ├── i18n/   # Localization (13 languages)
│       ├── utils/  # Shared utilities
│       └── ...     # React components, Redux store
└── shared/         # Code shared between GUI and CLI
tests/
└── gui/
    └── utils/      # Unit tests (Mocha + Chai)
```

## Running Tests

```bash
npm test                    # Run all tests
npm test -- --grep "Queue"  # Run specific tests
```

## Code Style

- TypeScript strict mode
- No telemetry, tracking, or analytics — ever
- Follow existing patterns in `lib/gui/app/utils/`

## Commit Messages

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `perf:` performance improvement
- `test:` tests
- `docs:` documentation
- `refactor:` code refactoring
- `security:` security improvements
- `ci:` CI/CD changes

## Privacy Policy

Spark has a strict zero-telemetry policy. Any PR that introduces tracking,
analytics, or data collection will be rejected. Run the telemetry audit
before submitting:

```bash
npm run audit:telemetry
```

## License

By contributing, you agree that your contributions will be licensed under
the Apache-2.0 license.
