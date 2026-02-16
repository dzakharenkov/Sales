"""
Конфигурация Telegram-бота SDS.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Telegram Bot Token (получить у @BotFather)
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()

# SDS API base URL (бот ходит в API)
SDS_API_URL = os.getenv("SDS_API_URL", "http://127.0.0.1:8000").strip()

# Таймаут запросов к API (сек)
API_TIMEOUT = int(os.getenv("API_TIMEOUT", "10"))

# Кэш справочников (сек)
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 час

# Часовой пояс
TIMEZONE = os.getenv("TIMEZONE", "Asia/Tashkent").strip()

# Блокировка после N неудачных попыток
MAX_LOGIN_ATTEMPTS = 5
LOGIN_BLOCK_MINUTES = 10
