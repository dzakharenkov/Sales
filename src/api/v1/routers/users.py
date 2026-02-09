"""
Управление пользователями: список, создание, смена пароля. Только admin.
Валидация телефона и email с понятными сообщениями на русском.
"""
import re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import User
from src.core.deps import get_current_user, require_admin
from src.core.security import hash_password

router = APIRouter()

ROLES = ("admin", "expeditor", "agent", "stockman", "paymaster")

# Телефон: цифры, +, пробелы, скобки, дефис
PHONE_RE = re.compile(r"^[\d\s+\-()]{0,20}$")
# Упрощённая проверка email
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class UserCreate(BaseModel):
    login: str
    fio: str
    password: str
    role: str = "agent"
    phone: str | None = None
    email: str | None = None

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str | None) -> str | None:
        if v is None or v.strip() == "":
            return None
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Телефон: только цифры, +, пробелы, скобки и дефис (до 20 символов).")
        return v

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str | None) -> str | None:
        if v is None or v.strip() == "":
            return None
        v = v.strip()
        if not EMAIL_RE.match(v):
            raise ValueError("Неверный формат email. Пример: user@example.com")
        return v


class UserUpdate(BaseModel):
    fio: str | None = None
    role: str | None = None
    phone: str | None = None
    email: str | None = None
    status: str | None = None

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        v = v.strip() if isinstance(v, str) else v
        if not PHONE_RE.match(v):
            raise ValueError("Телефон: только цифры, +, пробелы, скобки и дефис (до 20 символов).")
        return v

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        v = v.strip() if isinstance(v, str) else v
        if not EMAIL_RE.match(v):
            raise ValueError("Неверный формат email. Пример: user@example.com")
        return v


class UserSetPassword(BaseModel):
    password: str


@router.get("/users")
async def list_users(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Список пользователей. Только admin."""
    result = await session.execute(
        select(User).order_by(User.login)
    )
    rows = result.scalars().all()
    return [
        {
            "login": u.login,
            "fio": u.fio,
            "role": u.role,
            "status": u.status,
            "phone": u.phone,
            "email": u.email,
            "has_password": bool(u.password),
        }
        for u in rows
    ]


@router.post("/users")
async def create_user(
    body: UserCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Создать пользователя с паролем. Только admin."""
    if body.role not in ROLES:
        raise HTTPException(status_code=400, detail="Роль должна быть одна из: admin, expeditor, agent, stockman, paymaster.")
    result = await session.execute(select(User).where(User.login == body.login))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует. Выберите другой логин.")
    new_user = User(
        login=body.login,
        fio=body.fio,
        password=hash_password(body.password),
        role=body.role,
        phone=body.phone,
        email=body.email,
        status="активен",
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return {"login": new_user.login, "fio": new_user.fio, "role": new_user.role, "message": "created"}


@router.patch("/users/{login}")
async def update_user(
    login: str,
    body: UserUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Изменить данные пользователя (без пароля). Только admin."""
    result = await session.execute(select(User).where(User.login == login))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if body.fio is not None:
        target.fio = body.fio
    if body.role is not None:
        if body.role not in ROLES:
            raise HTTPException(status_code=400, detail="Роль должна быть одна из: admin, expeditor, agent, stockman, paymaster.")
        target.role = body.role
    if body.phone is not None:
        target.phone = body.phone
    if body.email is not None:
        target.email = body.email
    if body.status is not None:
        target.status = body.status
    await session.commit()
    await session.refresh(target)
    return {"login": target.login, "message": "updated"}


@router.post("/users/{login}/set-password")
async def set_password(
    login: str,
    body: UserSetPassword,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Установить или сменить пароль пользователя. Только admin."""
    result = await session.execute(select(User).where(User.login == login))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    target.password = hash_password(body.password)
    await session.commit()
    return {"login": login, "message": "password set"}
