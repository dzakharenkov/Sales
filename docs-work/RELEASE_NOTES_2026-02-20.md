# Release Notes — 2026-02-20

## Security and Dependency Updates
- Replaced `python-jose[cryptography]` with `PyJWT[crypto]`.
- Updated `fastapi` to `0.121.3` (brings `starlette` to `0.50.0`).
- Updated `httpx` to `0.28.1` and `python-telegram-bot` to `21.11.1`.

## JWT Migration Note
- File changed: `src/core/security.py`.
- JWT encoding/decoding now uses `PyJWT` (`jwt.encode` / `jwt.decode`).
- Validation exception changed to `InvalidTokenError`.

## Compatibility / Rollback
- If rollback is needed:
1. Restore `requirements.txt` auth/telegram/http stack to previous versions.
2. Revert `src/core/security.py` import/exception handling back to previous JWT library.
3. Reinstall dependencies and rerun:
   - `pytest tests -q`
   - `pytest tests/integration -q` (with live DB env vars)

## Validation Performed
- API/unit test suite: pass.
- Integration tests against live DB: pass.
- Telegram API connectivity (`getMe`): pass.
