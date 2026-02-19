[![CI](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci.yml)

# Sales & Distribution System

Core backend for SDS API and Telegram bot.

## Local checks

```bash
python -m pytest -q
ruff check src/ tests/
```

## CI overview

- `lint`: `ruff check`
- `test`: pytest + coverage gate (`>=50%` for critical API modules)
- `security-scan`: `ruff --select S`

## Branch protection

Enable branch protection for `main` in repository settings:

- Require status checks to pass before merging
- Required checks:
  - `Lint`
  - `Tests`
  - `Security Scan`
