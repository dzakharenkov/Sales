import os

import sentry_sdk

_DEFAULT_SENTRY_DSN = "https://2e08f933daa21810fb101576ee51bcb2@o4510907799961600.ingest.us.sentry.io/4510910634196992"
_TRUE_VALUES = {"1", "true", "yes", "on"}


def _is_sentry_enabled() -> bool:
    return os.getenv("SENTRY_ENABLED", "true").strip().lower() in _TRUE_VALUES


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
    )
