"""
Entry point for SDS Telegram bot.
Run: python -m src.telegram_bot.bot
"""
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from telegram.error import Conflict, NetworkError
from telegram.ext import Application

from src.core.sentry_setup import init_sentry
from .config import BOT_TOKEN
from .handlers_agent import register_agent_handlers
from .handlers_auth import register_auth_handlers
from .handlers_expeditor import register_expeditor_handlers
from .sds_api import api
from .session import close_pool, init_pool

load_dotenv()
init_sentry("sales-telegram-bot")

logger = logging.getLogger(__name__)

BOT_DB_DSN: str | None = None

_LOCK_FH = None
_LOCK_PATH = Path(".telegram_bot.lock")


def _build_bot_dsn() -> str:
    """Build DB DSN for bot session storage from environment only."""
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        # asyncpg expects standard PostgreSQL DSN without SQLAlchemy driver suffix.
        return database_url.replace("postgresql+asyncpg://", "postgresql://", 1)

    required = [
        "DATABASE_HOST",
        "DATABASE_PORT",
        "DATABASE_NAME",
        "DATABASE_USER",
        "DATABASE_PASSWORD",
    ]
    missing = [var for var in required if not os.getenv(var)]
    if missing:
        raise RuntimeError(
            "Missing required environment variables for bot DB: "
            + ", ".join(sorted(missing))
        )

    host = os.environ["DATABASE_HOST"]
    port = os.environ["DATABASE_PORT"]
    name = os.environ["DATABASE_NAME"]
    user = os.environ["DATABASE_USER"]
    password = os.environ["DATABASE_PASSWORD"]
    return f"postgresql://{user}:{password}@{host}:{port}/{name}"


def _acquire_single_instance_lock() -> bool:
    """Prevent multiple local polling instances."""
    global _LOCK_FH
    try:
        _LOCK_FH = _LOCK_PATH.open("a+")
        _LOCK_FH.seek(0)
        _LOCK_FH.truncate(0)
        _LOCK_FH.write(str(os.getpid()))
        _LOCK_FH.flush()
        if os.name == "nt":
            import msvcrt
            msvcrt.locking(_LOCK_FH.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(_LOCK_FH.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        return True
    except Exception as exc:
        logger.debug("Failed to acquire single-instance lock: %s", exc)
        return False


def _release_single_instance_lock() -> None:
    global _LOCK_FH
    try:
        if _LOCK_FH:
            if os.name == "nt":
                import msvcrt
                _LOCK_FH.seek(0)
                msvcrt.locking(_LOCK_FH.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                import fcntl
                fcntl.flock(_LOCK_FH.fileno(), fcntl.LOCK_UN)
            _LOCK_FH.close()
    except Exception as exc:
        logger.debug("Failed to release single-instance lock: %s", exc)
    finally:
        _LOCK_FH = None


async def post_init(application: Application):
    if not BOT_DB_DSN:
        raise RuntimeError("Bot DB DSN is not configured")
    await init_pool(BOT_DB_DSN)
    logger.info("Telegram bot initialized, DB pool ready")


async def post_shutdown(application: Application):
    await close_pool()
    await api.close()
    _release_single_instance_lock()
    logger.info("Telegram bot shutdown complete")


async def on_bot_error(update, context):
    err = context.error
    if isinstance(err, Conflict) or "terminated by other getUpdates request" in str(err):
        logger.error("Telegram polling conflict (409): another bot instance is running. Stopping this instance.")
        try:
            context.application.stop_running()
        except Exception as stop_running_error:
            logger.debug("stop_running failed: %s", stop_running_error)
            try:
                await context.application.stop()
            except Exception as stop_error:
                logger.debug("application.stop failed: %s", stop_error)
        return
    if isinstance(err, NetworkError) or "Bad Gateway" in str(err):
        logger.warning("Transient Telegram network error: %s", err)
        return
    logger.exception("Unhandled bot error", exc_info=err)


def run_bot():
    global BOT_DB_DSN

    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set! Cannot start bot.")
        return
    try:
        BOT_DB_DSN = _build_bot_dsn()
    except RuntimeError as exc:
        logger.error("%s", exc)
        return

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    if not _acquire_single_instance_lock():
        logger.error("Telegram bot is already running locally (instance lock is active).")
        return

    logger.info("Starting SDS Telegram Bot...")

    app = (
        Application.builder()
        .token(BOT_TOKEN)
        .post_init(post_init)
        .post_shutdown(post_shutdown)
        .build()
    )

    register_auth_handlers(app)
    register_expeditor_handlers(app)
    register_agent_handlers(app)
    app.add_error_handler(on_bot_error)

    logger.info("Bot handlers registered. Starting polling...")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    run_bot()
