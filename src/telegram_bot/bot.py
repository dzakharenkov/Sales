"""
Entry point for SDS Telegram bot.
Run: python -m src.telegram_bot.bot
"""
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from telegram.error import Conflict
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

# DSN for bot sessions/logs storage
DEFAULT_HOST = os.getenv("DATABASE_HOST", "45.141.76.83")
DEFAULT_PORT = os.getenv("DATABASE_PORT", "5433")
DEFAULT_NAME = os.getenv("DATABASE_NAME", "localdb")
DEFAULT_USER = os.getenv("DATABASE_USER", "postgres")
DEFAULT_PASSWORD = os.getenv("DATABASE_PASSWORD", "!Tesla11")
DB_DSN = f"postgresql://{DEFAULT_USER}:{DEFAULT_PASSWORD}@{DEFAULT_HOST}:{DEFAULT_PORT}/{DEFAULT_NAME}"

_LOCK_FH = None
_LOCK_PATH = Path(".telegram_bot.lock")


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
    await init_pool(DB_DSN)
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
        except Exception:
            try:
                await context.application.stop()
            except Exception:
                pass
        return
    logger.exception("Unhandled bot error", exc_info=err)


def run_bot():
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set! Cannot start bot.")
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
