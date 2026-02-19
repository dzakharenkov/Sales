"""Warehouse endpoint schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class WarehouseStockResponse(BaseModel):
    model_config = ConfigDict(extra="allow", from_attributes=True)
