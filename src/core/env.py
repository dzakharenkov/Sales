"""Environment helpers for required runtime configuration."""

from __future__ import annotations

import base64
import os
from typing import Iterable

from dotenv import dotenv_values


def get_required_env(var_name: str) -> str:
    """Return required env var or raise a clear runtime error."""
    env_value = os.environ.get(var_name)
    if env_value is None:
        env_value = str(dotenv_values(".env").get(var_name, ""))
    value = env_value.strip()
    if not value:
        raise RuntimeError(
            f"Required environment variable {var_name!r} is not set. "
            "Configure it in .env or process environment."
        )
    return value


def validate_required_env_vars(required_vars: Iterable[str]) -> None:
    """Validate that all required env vars are present and non-empty."""
    missing = []
    for var in required_vars:
        try:
            get_required_env(var)
        except RuntimeError:
            missing.append(var)
    if missing:
        raise RuntimeError(
            "Missing required environment variables: "
            + ", ".join(sorted(missing))
            + ". Configure them before startup."
        )


def validate_jwt_secret_strength(secret: str, min_bytes: int = 32) -> None:
    """Validate JWT secret has at least ``min_bytes`` entropy."""
    raw = secret.encode("utf-8")
    try:
        padded = secret + "=" * ((4 - len(secret) % 4) % 4)
        decoded = base64.urlsafe_b64decode(padded.encode("ascii"))
        if decoded:
            raw = decoded
    except Exception:
        # Secret might be plain text (e.g., token_hex). Validate length as-is.
        pass

    if len(raw) < min_bytes:
        raise RuntimeError(
            "JWT_SECRET_KEY is too weak: minimum 32 bytes required. "
            "Generate with: python -c \"import base64,secrets; "
            "print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())\""
        )


def validate_runtime_secrets() -> None:
    """Validate mandatory secrets for API/bot runtime."""
    required = ("DATABASE_URL", "JWT_SECRET_KEY", "TELEGRAM_BOT_TOKEN")
    validate_required_env_vars(required)
    validate_jwt_secret_strength(get_required_env("JWT_SECRET_KEY"))
