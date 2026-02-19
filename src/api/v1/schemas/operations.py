"""Operation endpoint schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class OperationResponse(BaseModel):
    id: int

    model_config = ConfigDict(extra="allow", from_attributes=True)


class OperationTypeResponse(BaseModel):
    code: str
    name: str

    model_config = ConfigDict(extra="allow", from_attributes=True)
