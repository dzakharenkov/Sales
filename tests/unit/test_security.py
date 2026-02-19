from __future__ import annotations

from src.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hash_and_verify() -> None:
    password = "MySecretPass123"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_create_and_decode() -> None:
    token = create_access_token(login="testuser", role="admin")
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == "testuser"
    assert payload["role"] == "admin"


def test_jwt_decode_invalid_token_returns_none() -> None:
    assert decode_access_token("invalid.jwt.token") is None
