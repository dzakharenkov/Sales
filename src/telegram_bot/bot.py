"""
Точка входа Telegram-бота SDS v2.2.
Запуск: python -m src.telegram_bot.bot
"""
import asyncio
import logging
import os

from dotenv import load_dotenv

load_dotenv()

from telegram.ext import Application

from src.core.sentry_setup import init_sentry
from .config import BOT_TOKEN
from .session import init_pool, close_pool
from .sds_api import api
from .handlers_auth import register_auth_handlers
from .handlers_expeditor import register_expeditor_handlers
from .handlers_agent import register_agent_handlers

init_sentry("sales-telegram-bot")

logger = logging.getLogger(__name__)

# DSN для asyncpg (прямой доступ к БД для сессий и логов)
DEFAULT_HOST = os.getenv("DATABASE_HOST", "45.141.76.83")
DEFAULT_PORT = os.getenv("DATABASE_PORT", "5433")
DEFAULT_NAME = os.getenv("DATABASE_NAME", "localdb")
DEFAULT_USER = os.getenv("DATABASE_USER", "postgres")
DEFAULT_PASSWORD = os.getenv("DATABASE_PASSWORD", "!Tesla11")
DB_DSN = f"postgresql://{DEFAULT_USER}:{DEFAULT_PASSWORD}@{DEFAULT_HOST}:{DEFAULT_PORT}/{DEFAULT_NAME}"


async def post_init(application: Application):
    """Инициализация после создания бота."""
    await init_pool(DB_DSN)
    logger.info("Telegram bot initialized, DB pool ready")


async def post_shutdown(application: Application):
    """Очистка при остановке."""
    await close_pool()
    await api.close()
    logger.info("Telegram bot shutdown complete")


def run_bot():
    """Запуск бота (блокирующий)."""
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set! Cannot start bot.")
        return

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    logger.info("Starting SDS Telegram Bot...")

    app = (
        Application.builder()
        .token(BOT_TOKEN)
        .post_init(post_init)
        .post_shutdown(post_shutdown)
        .build()
    )

    # Регистрация обработчиков
    register_auth_handlers(app)
    register_expeditor_handlers(app)
    register_agent_handlers(app)

    logger.info("Bot handlers registered. Starting polling...")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    run_bot()
