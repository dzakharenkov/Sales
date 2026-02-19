"""Structured logging configuration for API and bot services."""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

from loguru import logger

_LOGGING_CONFIGURED = False


class _InterceptHandler(logging.Handler):
    """Forward standard logging records to loguru."""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        logger.opt(exception=record.exc_info).log(level, record.getMessage())


def setup_logging(
    service_name: str,
    log_level: str | None = None,
    log_file: str | None = None,
) -> None:
    """Configure structured logging for the current process."""
    global _LOGGING_CONFIGURED
    if _LOGGING_CONFIGURED:
        return

    effective_level = (log_level or os.getenv("LOG_LEVEL", "INFO")).upper()
    effective_log_file = log_file or os.getenv("LOG_FILE", "logs/app.log")
    log_path = Path(effective_log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    logger.remove()
    logger.add(
        sys.stdout,
        level=effective_level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level:<8} | {name}:{function}:{line} | {message}",
        colorize=False,
    )
    logger.add(
        str(log_path),
        level=effective_level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level:<8} | {name}:{function}:{line} | {message}",
        rotation="10 MB",
        retention="7 days",
        compression="gz",
        serialize=False,
    )

    intercept_handler = _InterceptHandler()
    logging.root.handlers = [intercept_handler]
    logging.root.setLevel(effective_level)

    # Route noisy framework loggers through the same handler.
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        framework_logger = logging.getLogger(logger_name)
        framework_logger.handlers = [intercept_handler]
        framework_logger.propagate = False
        framework_logger.setLevel(effective_level)

    logger.info(
        "Logging configured for service={} level={} file={}",
        service_name,
        effective_level,
        str(log_path),
    )
    _LOGGING_CONFIGURED = True
