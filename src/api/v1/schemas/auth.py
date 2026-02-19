"""Auth endpoint schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    login: str
    password: str


class UserInfo(BaseModel):
    login: str
    fio: str
    role: str
    phone: str | None = None
    email: str | None = None
    status: str
    telegram_username: str | None = None

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


class RuntimeConfigResponse(BaseModel):
    sentry_enabled: bool
