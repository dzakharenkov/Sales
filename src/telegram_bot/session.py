"""
Менеджер сессий: хранение в БД (telegram_sessions), блокировка входа (telegram_login_attempts),
логирование (telegram_logs).
"""
import logging
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass, field

import asyncpg

from .config import MAX_LOGIN_ATTEMPTS, LOGIN_BLOCK_MINUTES

logger = logging.getLogger(__name__)

# Пул соединений — создаётся при старте бота
_pool: asyncpg.Pool | None = None


async def init_pool(dsn: str):
    global _pool
    _pool = await asyncpg.create_pool(dsn=dsn, min_size=2, max_size=10)
    logger.info("Telegram bot DB pool created")


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


def _pool_or_raise() -> asyncpg.Pool:
    if not _pool:
        raise RuntimeError("DB pool not initialized — call init_pool() first")
    return _pool


# ---------- Data class ----------

@dataclass
class UserSession:
    telegram_user_id: int
    login: str
    jwt_token: str
    role: str
    fio: str = ""
    last_activity_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


# In-memory cache {telegram_user_id: UserSession}
_sessions: dict[int, UserSession] = {}


# ---------- Session CRUD ----------

async def get_session(tg_user_id: int) -> UserSession | None:
    """Получить сессию из кэша или БД."""
    if tg_user_id in _sessions:
        return _sessions[tg_user_id]
    pool = _pool_or_raise()
    row = await pool.fetchrow(
        'SELECT telegram_user_id, login, jwt_token, role, fio, last_activity_at '
        'FROM "Sales".telegram_sessions WHERE telegram_user_id = $1',
        tg_user_id,
    )
    if not row:
        return None
    s = UserSession(
        telegram_user_id=row["telegram_user_id"],
        login=row["login"],
        jwt_token=row["jwt_token"],
        role=row["role"],
        fio=row["fio"] or "",
        last_activity_at=row["last_activity_at"],
    )
    _sessions[tg_user_id] = s
    return s


async def save_session(s: UserSession):
    """Upsert сессии в БД и кэш."""
    pool = _pool_or_raise()
    await pool.execute(
        '''INSERT INTO "Sales".telegram_sessions
           (telegram_user_id, login, jwt_token, role, fio, last_activity_at)
           VALUES ($1, $2, $3, $4, $5, now())
           ON CONFLICT (telegram_user_id) DO UPDATE SET
             login = EXCLUDED.login,
             jwt_token = EXCLUDED.jwt_token,
             role = EXCLUDED.role,
             fio = EXCLUDED.fio,
             last_activity_at = now()''',
        s.telegram_user_id, s.login, s.jwt_token, s.role, s.fio,
    )
    _sessions[s.telegram_user_id] = s


async def touch_session(tg_user_id: int):
    """Обновить last_activity_at."""
    pool = _pool_or_raise()
    await pool.execute(
        'UPDATE "Sales".telegram_sessions SET last_activity_at = now() WHERE telegram_user_id = $1',
        tg_user_id,
    )
    if tg_user_id in _sessions:
        _sessions[tg_user_id].last_activity_at = datetime.now(timezone.utc)


async def delete_session(tg_user_id: int):
    """Удалить сессию."""
    pool = _pool_or_raise()
    await pool.execute(
        'DELETE FROM "Sales".telegram_sessions WHERE telegram_user_id = $1',
        tg_user_id,
    )
    _sessions.pop(tg_user_id, None)


# ---------- Login attempts ----------

async def count_recent_failures(tg_user_id: int) -> int:
    """Кол-во неудачных попыток за последние LOGIN_BLOCK_MINUTES минут."""
    pool = _pool_or_raise()
    since = datetime.now(timezone.utc) - timedelta(minutes=LOGIN_BLOCK_MINUTES)
    row = await pool.fetchrow(
        'SELECT COUNT(*)::int AS cnt FROM "Sales".telegram_login_attempts '
        'WHERE telegram_user_id = $1 AND attempted_at > $2 AND success = FALSE',
        tg_user_id, since,
    )
    return row["cnt"] if row else 0


async def record_attempt(tg_user_id: int, success: bool):
    pool = _pool_or_raise()
    await pool.execute(
        'INSERT INTO "Sales".telegram_login_attempts (telegram_user_id, success) VALUES ($1, $2)',
        tg_user_id, success,
    )


# ---------- Logging ----------

async def log_action(
    tg_user_id: int | None,
    login: str | None,
    role: str | None,
    action_type: str,
    detail: str | None = None,
    result: str | None = None,
    error_message: str | None = None,
):
    try:
        pool = _pool_or_raise()
        await pool.execute(
            'INSERT INTO "Sales".telegram_logs '
            '(telegram_user_id, login, role, action_type, detail, result, error_message) '
            'VALUES ($1, $2, $3, $4, $5, $6, $7)',
            tg_user_id, login, role, action_type, detail, result, error_message,
        )
    except Exception as e:
        logger.error("Failed to log action: %s", e)
