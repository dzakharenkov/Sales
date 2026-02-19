from pathlib import Path

from src.core.sql import escape_like


ROUTER_FILES = [
    Path("src/api/v1/routers/customers.py"),
    Path("src/api/v1/routers/orders.py"),
    Path("src/api/v1/routers/operations.py"),
    Path("src/api/v1/routers/reports.py"),
    Path("src/api/v1/routers/visits.py"),
    Path("src/api/v1/routers/finances.py"),
]


def test_escape_like_handles_wildcards_and_escape_char() -> None:
    payload = r"100%_match\name"
    assert escape_like(payload) == r"100\%\_match\\name"


def test_no_text_fstring_patterns_in_audited_routers() -> None:
    for file_path in ROUTER_FILES:
        content = file_path.read_text(encoding="utf-8")
        assert "text(f\"" not in content
        assert "text(f'" not in content

