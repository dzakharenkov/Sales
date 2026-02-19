"""Dictionary endpoint schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class DictionaryEntryResponse(BaseModel):
    model_config = ConfigDict(extra="allow", from_attributes=True)


class NextCodeResponse(BaseModel):
    next_code: int


class CityResponse(BaseModel):
    id: int
    name: str
    region: str | None = None
    active: bool = True

    model_config = ConfigDict(from_attributes=True)


class CityCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    region: str | None = None


class TerritoryResponse(BaseModel):
    id: int
    name: str
    city_id: int | None = None
    active: bool = True

    model_config = ConfigDict(from_attributes=True)


class TerritoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    city_id: int | None = None
