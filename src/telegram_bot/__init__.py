"""
Telegram-бот SDS v2.1 — экспедитор и агент.
Авторизация, заказы, визиты, фото, создание заказа.
Запуск: python -m src.telegram_bot.bot
"""
from .bot import run_bot

__all__ = ["run_bot"]
