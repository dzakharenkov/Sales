"""Common reusable response schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class EntityModel(BaseModel):
    """Generic object payload with permissive fields for legacy endpoints."""

    model_config = ConfigDict(extra="allow", from_attributes=True)


class SuccessResponse(BaseModel):
    """Standard success status envelope."""

    success: bool = True
    message: str | None = None


class MessageResponse(BaseModel):
    """Simple message envelope."""

    message: str


class IdResponse(SuccessResponse):
    """Success envelope with optional identifier."""

    id: int | None = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class ErrorResponse(BaseModel):
    error: ErrorDetail
