import os

import sentry_sdk

_DEFAULT_SENTRY_DSN = "https://2e08f933daa21810fb101576ee51bcb2@o4510907799961600.ingest.us.sentry.io/4510910634196992"
_TRUE_VALUES = {"1", "true", "yes", "on"}


def _is_sentry_enabled() -> bool:
    return os.getenv("SENTRY_ENABLED", "true").strip().lower() in _TRUE_VALUES


def _is_telegram_getupdates_conflict(event: dict) -> bool:
    msg = ((event.get("message") or "") + " " + (event.get("logentry", {}).get("message") or "")).lower()
    if "terminated by other getupdates request" in msg:
        return True
    if "getupdates" in msg and "409" in msg and "conflict" in msg:
        return True

    for exc in event.get("exception", {}).get("values", []) or []:
        value = str(exc.get("value") or "").lower()
        exc_type = str(exc.get("type") or "").lower()
        if "terminated by other getupdates request" in value:
            return True
        if "conflict" in exc_type and "getupdates" in value:
            return True
    return False


def _before_send(event: dict, hint: dict):
    ignore_conflict = os.getenv("SENTRY_IGNORE_TELEGRAM_CONFLICT", "true").strip().lower() in _TRUE_VALUES
    if ignore_conflict and _is_telegram_getupdates_conflict(event):
        return None
    return event


def init_sentry(service_name: str) -> None:
    """Initialize Sentry SDK once at application startup."""
    if not _is_sentry_enabled():
        return

    dsn = os.getenv("SENTRY_DSN", _DEFAULT_SENTRY_DSN).strip()
    if not dsn:
        return

    traces_sample_rate = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "1.0"))

    sentry_sdk.init(
        dsn=dsn,
        send_default_pii=True,
        traces_sample_rate=traces_sample_rate,
        environment=os.getenv("SENTRY_ENVIRONMENT", os.getenv("ENVIRONMENT", "production")),
        release=os.getenv("SENTRY_RELEASE"),
        server_name=service_name,
        before_send=_before_send,
    )
