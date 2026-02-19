from starlette.requests import Request

from src.core.middleware import _extract_user_login


def _make_request(auth_header: str | None) -> Request:
    headers = []
    if auth_header is not None:
        headers.append((b"authorization", auth_header.encode("utf-8")))
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/api/v1/test",
        "headers": headers,
    }
    return Request(scope)


def test_extract_user_login_anonymous_without_header():
    request = _make_request(None)
    assert _extract_user_login(request) == "anonymous"


def test_extract_user_login_unknown_for_invalid_token():
    request = _make_request("Bearer invalid-token")
    assert _extract_user_login(request) == "unknown"

