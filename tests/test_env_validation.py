import importlib
import os
import sys

import pytest

from src.core.env import validate_jwt_secret_strength, validate_required_env_vars


def test_validate_required_env_vars_reports_missing(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "")
    monkeypatch.setenv("JWT_SECRET_KEY", "")

    with pytest.raises(RuntimeError, match="DATABASE_URL"):
        validate_required_env_vars(["DATABASE_URL", "JWT_SECRET_KEY"])


def test_validate_jwt_secret_strength_rejects_weak_secret():
    with pytest.raises(RuntimeError, match="too weak"):
        validate_jwt_secret_strength("short")


def test_database_connection_requires_database_url(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "")
    monkeypatch.setenv("JWT_SECRET_KEY", "x" * 32)
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "test-token")

    sys.modules.pop("src.core.config", None)
    sys.modules.pop("src.database.connection", None)
    with pytest.raises(Exception, match="DATABASE_URL"):
        importlib.import_module("src.database.connection")
