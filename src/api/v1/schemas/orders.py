"""Order endpoint schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class OrderResponse(BaseModel):
    id: int

    model_config = ConfigDict(extra="allow", from_attributes=True)


class OrderItemResponse(BaseModel):
    id: int

    model_config = ConfigDict(extra="allow", from_attributes=True)


class OrderStatusResponse(BaseModel):
    code: str
    name: str
