"""Auth endpoints: login, logout, current user, frontend config."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.schemas.common import EntityModel
from src.core.config import settings
from src.core.deps import get_current_user
from src.core.security import create_access_token, verify_password
from src.database.connection import get_db_session
from src.database.models import User

router = APIRouter()

CREDENTIALS_COOKIE_NAME = "sds_at"
_FAILED_LOGIN_ATTEMPTS: dict[str, int] = {}
_LOGIN_BLOCKED_UNTIL: dict[str, datetime] = {}


class LoginRequest(BaseModel):
    login: str
    password: str


class UserResponse(BaseModel):
    login: str
    fio: str
    role: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_login(login: str) -> str:
    return (login or "").strip().lower()


def _is_login_blocked(login: str) -> tuple[bool, int]:
    key = _normalize_login(login)
    if not key:
        return False, 0
    blocked_until = _LOGIN_BLOCKED_UNTIL.get(key)
    if not blocked_until:
        return False, 0

    seconds_left = int((blocked_until - _now_utc()).total_seconds())
    if seconds_left <= 0:
        _LOGIN_BLOCKED_UNTIL.pop(key, None)
        _FAILED_LOGIN_ATTEMPTS.pop(key, None)
        return False, 0

    minutes_left = max(1, seconds_left // 60)
    return True, minutes_left


def _register_failed_login(login: str) -> None:
    key = _normalize_login(login)
    if not key:
        return

    attempts = _FAILED_LOGIN_ATTEMPTS.get(key, 0) + 1
    _FAILED_LOGIN_ATTEMPTS[key] = attempts
    if attempts >= settings.max_login_attempts:
        _LOGIN_BLOCKED_UNTIL[key] = _now_utc() + timedelta(minutes=settings.login_block_minutes)
        _FAILED_LOGIN_ATTEMPTS[key] = 0


def _clear_failed_login(login: str) -> None:
    key = _normalize_login(login)
    if not key:
        return
    _FAILED_LOGIN_ATTEMPTS.pop(key, None)
    _LOGIN_BLOCKED_UNTIL.pop(key, None)


@router.post("/auth/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
):
    """Login with password, return JWT and set httpOnly cookie."""
    blocked, minutes_left = _is_login_blocked(body.login)
    if blocked:
        raise HTTPException(
            status_code=429,
            detail=f"Account temporarily blocked. Try again in {minutes_left} minute(s).",
        )

    result = await session.execute(select(User).where(User.login == body.login))
    user = result.scalar_one_or_none()
    if not user:
        _register_failed_login(body.login)
        raise HTTPException(status_code=401, detail="Invalid login or password")

    if user.status and user.status.lower() != "активен":
        raise HTTPException(status_code=403, detail="User is not active")

    if not verify_password(body.password, user.password):
        _register_failed_login(body.login)
        raise HTTPException(status_code=401, detail="Invalid login or password")

    _clear_failed_login(body.login)
    token = create_access_token(login=user.login, role=user.role or "")
    response.set_cookie(
        key=CREDENTIALS_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=not settings.api_debug,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )
    return LoginResponse(
        access_token=token,
        user=UserResponse(login=user.login, fio=user.fio or "", role=user.role or ""),
    )


@router.post("/auth/logout", response_model=EntityModel | list[EntityModel])
async def logout(response: Response):
    """Logout by clearing auth cookie."""
    response.delete_cookie(key=CREDENTIALS_COOKIE_NAME, path="/")
    return {"success": True}


@router.get("/auth/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    """Current user by token."""
    return UserResponse(login=user.login, fio=user.fio or "", role=user.role or "")


@router.get("/config", response_model=EntityModel | list[EntityModel])
async def get_config(_: User = Depends(get_current_user)):
    """Frontend config for authorized users."""
    return {"yandexMapsApiKey": settings.yandex_maps_api_key}
