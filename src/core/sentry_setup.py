import sentry_sdk

from src.core.config import settings


def _is_sentry_enabled() -> bool:
    return bool(settings.sentry_enabled)


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
    ignore_conflict = bool(settings.sentry_ignore_telegram_conflict)
    if ignore_conflict and _is_telegram_getupdates_conflict(event):
        return None
    return event


def init_sentry(service_name: str) -> None:
    """Initialize Sentry SDK once at application startup."""
    if not _is_sentry_enabled():
        return

    dsn = settings.sentry_dsn.strip()
    if not dsn:
        return

    traces_sample_rate = float(settings.sentry_traces_sample_rate)

    sentry_sdk.init(
        dsn=dsn,
        send_default_pii=True,
        traces_sample_rate=traces_sample_rate,
        environment=settings.sentry_environment,
        release=settings.sentry_release,
        server_name=service_name,
        before_send=_before_send,
    )
