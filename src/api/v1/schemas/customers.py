"""Customer endpoint schemas."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class CustomerResponse(BaseModel):
    id: int
    name_client: str | None = None
    firm_name: str | None = None
    category_client: str | None = None
    address: str | None = None
    city_id: int | None = None
    territory_id: int | None = None
    phone: str | None = None
    email: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    login_agent: str | None = None
    login_expeditor: str | None = None
    region: str | None = None
    district: str | None = None
    status: str | None = None
    main_photo_id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(extra="allow", from_attributes=True)


class CustomerVisitResponse(BaseModel):
    id: int
    visit_date: date | datetime | None = None
    notes: str | None = None

    model_config = ConfigDict(extra="allow", from_attributes=True)


class CustomerBalanceResponse(BaseModel):
    customer_id: int
    balance: float


class CustomerImportResponse(BaseModel):
    imported: int
    skipped: int
    errors: list[str]
