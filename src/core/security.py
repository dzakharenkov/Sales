"""Password hashing and JWT helpers for authentication."""

import os
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from src.core.env import get_required_env

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "60"))

# bcrypt accepts max 72 bytes
BCRYPT_MAX_BYTES = 72


def _password_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    """Hash password for DB storage."""
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str | None) -> bool:
    """Verify plain password against hash."""
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(_password_bytes(plain), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(login: str, role: str) -> str:
    """Create JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": login, "role": role, "exp": expire}
    return jwt.encode(payload, get_required_env("JWT_SECRET_KEY"), algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Decode JWT token. Return None on failure."""
    try:
        return jwt.decode(token, get_required_env("JWT_SECRET_KEY"), algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
