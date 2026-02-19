"""User management schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    login: str
    fio: str
    role: str
    phone: str | None = None
    email: str | None = None
    status: str
    telegram_username: str | None = None

    model_config = ConfigDict(from_attributes=True)


class UserPasswordSetResponse(BaseModel):
    success: bool = True
