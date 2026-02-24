# Usage Guide

## Run API
```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Open Interfaces
- API docs: `http://127.0.0.1:8000/docs`
- Login page: `http://127.0.0.1:8000/login`
- App page: `http://127.0.0.1:8000/app`
- Health: `http://127.0.0.1:8000/health`

## Common Tasks
### Lint
```bash
make lint
```

### Type-check
```bash
make typecheck
```

### Test
```bash
make test
```

## Security Behavior (Task 001)
- App startup fails if required env vars are missing.
- JWT secret is validated for minimum entropy (32 bytes).
- No runtime hardcoded DB/JWT/Telegram credential fallbacks are used.

