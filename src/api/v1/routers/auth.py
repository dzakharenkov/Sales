"""
Авторизация: логин + пароль (проверка по БД), возврат JWT.
Эндпоинт /auth/me — кто сейчас вошёл (по токену).
Эндпоинт /config — публичная конфигурация для фронта (ключи карт и т.п.).
"""
import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import User
from src.core.security import verify_password, create_access_token
from src.core.deps import get_current_user

router = APIRouter()


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


@router.post("/auth/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    session: AsyncSession = Depends(get_db_session),
):
    """Вход по логину и паролю. Пароль проверяется по хешу в БД. Возвращает JWT."""
    result = await session.execute(
        select(User).where(User.login == body.login)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid login or password")
    if user.status and user.status.lower() != "активен":
        raise HTTPException(status_code=403, detail="User is not active")
    if not verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid login or password")
    token = create_access_token(login=user.login, role=user.role or "")
    return LoginResponse(
        access_token=token,
        user=UserResponse(login=user.login, fio=user.fio or "", role=user.role or ""),
    )


@router.get("/auth/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    """Текущий пользователь по токену (для страницы после входа)."""
    return UserResponse(login=user.login, fio=user.fio or "", role=user.role or "")


@router.get("/config")
async def get_config(_: User = Depends(get_current_user)):
    """Конфигурация для фронта (ключи и т.п.). Только для авторизованных."""
    return {
        "yandexMapsApiKey": os.environ.get("YANDEX_MAPS_API_KEY", ""),
    }
