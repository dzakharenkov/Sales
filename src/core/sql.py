"""SQL helper utilities."""


def escape_like(value: str) -> str:
    """Escape special symbols used by SQL LIKE/ILIKE patterns."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

