import importlib
import os
import sys

import pytest

from src.core.env import validate_jwt_secret_strength, validate_required_env_vars


def test_validate_required_env_vars_reports_missing(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)

    with pytest.raises(RuntimeError, match="DATABASE_URL"):
        validate_required_env_vars(["DATABASE_URL", "JWT_SECRET_KEY"])


def test_validate_jwt_secret_strength_rejects_weak_secret():
    with pytest.raises(RuntimeError, match="too weak"):
        validate_jwt_secret_strength("short")


def test_database_connection_requires_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)

    sys.modules.pop("src.database.connection", None)
    with pytest.raises(RuntimeError, match="DATABASE_URL"):
        importlib.import_module("src.database.connection")
