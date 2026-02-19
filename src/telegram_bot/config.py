"""Telegram bot configuration constants."""

from src.core.config import settings

BOT_TOKEN = settings.telegram_bot_token.strip()
SDS_API_URL = settings.sds_api_url.strip()
API_TIMEOUT = settings.api_timeout
CACHE_TTL = settings.cache_ttl
TIMEZONE = settings.timezone.strip()
MAX_LOGIN_ATTEMPTS = settings.max_login_attempts
LOGIN_BLOCK_MINUTES = settings.login_block_minutes
