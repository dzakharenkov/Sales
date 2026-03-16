"""Centralized application settings loaded from environment."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed runtime settings for API and Telegram bot."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    database_url: str = Field(..., min_length=1, validation_alias="DATABASE_URL")

    jwt_secret_key: str = Field(..., min_length=32, validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=60, validation_alias="JWT_EXPIRATION_MINUTES")

    telegram_bot_token: str = Field(..., min_length=1, validation_alias="TELEGRAM_BOT_TOKEN")
    sds_api_url: str = Field(default="http://127.0.0.1:8000", validation_alias="SDS_API_URL")
    api_timeout: int = Field(default=30, validation_alias="API_TIMEOUT")

    api_host: str = Field(default="0.0.0.0", validation_alias="API_HOST")  # nosec B104
    api_port: int = Field(default=8000, validation_alias="API_PORT")
    api_debug: bool = Field(default=False, validation_alias="API_DEBUG")
    cors_allowed_origins: str = Field(
        default="https://sales.zakharenkov.ru,http://localhost:8000,http://127.0.0.1:8000",
        validation_alias="CORS_ALLOWED_ORIGINS",
    )

    upload_dir: str = Field(default="photo", validation_alias="UPLOAD_DIR")
    site_url: str = Field(default="http://localhost:8000", validation_alias="SITE_URL")

    yandex_maps_api_key: str = Field(default="", validation_alias="YANDEX_MAPS_API_KEY")

    sentry_enabled: bool = Field(default=True, validation_alias="SENTRY_ENABLED")
    sentry_dsn: str = Field(default="", validation_alias="SENTRY_DSN")
    sentry_traces_sample_rate: float = Field(default=1.0, validation_alias="SENTRY_TRACES_SAMPLE_RATE")
    sentry_environment: str = Field(default="production", validation_alias="SENTRY_ENVIRONMENT")
    sentry_release: str | None = Field(default=None, validation_alias="SENTRY_RELEASE")
    sentry_ignore_telegram_conflict: bool = Field(
        default=True,
        validation_alias="SENTRY_IGNORE_TELEGRAM_CONFLICT",
    )

    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    log_file: str = Field(default="logs/app.log", validation_alias="LOG_FILE")
    bot_log_file: str = Field(default="logs/telegram_bot.log", validation_alias="BOT_LOG_FILE")

    cache_ttl: int = Field(default=3600, validation_alias="CACHE_TTL")
    max_login_attempts: int = Field(default=5, validation_alias="MAX_LOGIN_ATTEMPTS")
    login_block_minutes: int = Field(default=10, validation_alias="LOGIN_BLOCK_MINUTES")
    telegram_session_ttl_minutes: int = Field(default=720, validation_alias="TELEGRAM_SESSION_TTL_MINUTES")
    timezone: str = Field(default="Asia/Tashkent", validation_alias="TIMEZONE")
    enabled_languages: str = Field(default="ru,uz,en", validation_alias="ENABLED_LANGUAGES")
    default_language: str = Field(default="ru", validation_alias="DEFAULT_LANGUAGE")

    @property
    def cors_origins(self) -> list[str]:
        values = [origin.strip() for origin in self.cors_allowed_origins.split(",")]
        return [origin for origin in values if origin]

    @property
    def enabled_languages_list(self) -> list[str]:
        values = [lang.strip().lower() for lang in self.enabled_languages.split(",")]
        langs = [lang for lang in values if lang]
        return langs or ["ru"]

    @property
    def effective_default_language(self) -> str:
        default_lang = (self.default_language or "").strip().lower() or "ru"
        if default_lang in self.enabled_languages_list:
            return default_lang
        return self.enabled_languages_list[0]


settings = Settings()
