"""Entry point for SDS Telegram bot.
Run: python -m src.telegram_bot.bot
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from loguru import logger
from telegram.error import Conflict
from telegram.ext import Application

from src.core.config import settings
from src.core.env import get_required_env, validate_required_env_vars
from src.core.logging_setup import setup_logging
from src.core.sentry_setup import init_sentry
from .config import BOT_TOKEN
from .handlers_agent import register_agent_handlers
from .handlers_auth import register_auth_handlers
from .handlers_expeditor import register_expeditor_handlers
from .sds_api import api
from .session import close_pool, init_pool

load_dotenv()
init_sentry("sales-telegram-bot")
setup_logging(
    service_name="sales-telegram-bot",
    log_level=settings.log_level,
    log_file=settings.bot_log_file,
)

_LOCK_FH = None
_LOCK_PATH = Path(".telegram_bot.lock")


def _get_bot_db_dsn() -> str:
    raw_url = get_required_env("DATABASE_URL")
    if "+asyncpg" in raw_url:
        return raw_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    if "+psycopg" in raw_url:
        return raw_url.replace("postgresql+psycopg://", "postgresql://", 1)
    return raw_url


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
    except Exception:
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
    except Exception:
        pass
    finally:
        _LOCK_FH = None


async def post_init(application: Application):
    await init_pool(_get_bot_db_dsn())
    logger.info("Telegram bot initialized, DB pool ready")


async def post_shutdown(application: Application):
    await close_pool()
    await api.close()
    _release_single_instance_lock()
    logger.info("Telegram bot shutdown complete")


async def on_bot_error(update, context):
    err = context.error
    user_id = None
    handler_name = "unknown"
    if update is not None and getattr(update, "effective_user", None):
        user_id = update.effective_user.id
    if context is not None and getattr(context, "handler", None):
        handler_name = context.handler.__class__.__name__
    if isinstance(err, Conflict) or "terminated by other getUpdates request" in str(err):
        logger.error(
            "bot_error type=conflict user_id={} handler={} message={}",
            user_id,
            handler_name,
            "Telegram polling conflict (409)",
        )
        try:
            context.application.stop_running()
        except Exception:
            try:
                await context.application.stop()
            except Exception:
                pass
        return
    logger.exception(
        "bot_error type=unhandled user_id={} handler={} message={}",
        user_id,
        handler_name,
        str(err),
    )


def run_bot():
    validate_required_env_vars(["DATABASE_URL", "TELEGRAM_BOT_TOKEN"])
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set! Cannot start bot.")
        return

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
