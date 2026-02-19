"""Visit endpoint schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class VisitResponse(BaseModel):
    id: int

    model_config = ConfigDict(extra="allow", from_attributes=True)
