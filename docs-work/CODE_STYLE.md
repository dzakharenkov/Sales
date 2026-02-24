# Code Style

## Formatter and Linter
- Ruff is the primary formatter/linter.
- Config: `pyproject.toml`
- Line length: `100`
- Target Python: `3.13`

## Commands
```bash
make lint
make format
make typecheck
```

## Typing
- `mypy` is enabled for `src/`.
- `disallow_untyped_defs = true`.

## Security/Config Rules
- No hardcoded secrets in source.
- Required runtime secrets must come from environment variables.
- Keep `.env.example` as placeholders only.

