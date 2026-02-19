import importlib
import sys


def _reload_connection_module():
    sys.modules.pop("src.database.connection", None)
    return importlib.import_module("src.database.connection")


def test_async_queue_pool_configured(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://u:p@localhost:5432/db")
    module = _reload_connection_module()

    assert module.engine.pool.__class__.__name__ == "AsyncAdaptedQueuePool"
    assert module.DB_POOL_SIZE == 10
    assert module.DB_MAX_OVERFLOW == 20
    assert module.DB_POOL_TIMEOUT == 30
    assert module.DB_POOL_RECYCLE == 1800

