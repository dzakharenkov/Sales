"""Dictionary endpoint schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class DictionaryEntryResponse(BaseModel):
    model_config = ConfigDict(extra="allow", from_attributes=True)


class NextCodeResponse(BaseModel):
    next_code: int
