from __future__ import annotations

import pytest
from pydantic import ValidationError

from src.api.v1.schemas.auth import LoginRequest, LoginResponse, RuntimeConfigResponse, UserInfo
from src.api.v1.schemas.common import EntityModel, ErrorDetail, ErrorResponse, IdResponse, MessageResponse
from src.api.v1.schemas.customers import (
    CustomerBalanceResponse,
    CustomerImportResponse,
    CustomerResponse,
    CustomerVisitResponse,
)
from src.api.v1.schemas.dictionary import CityCreate, CityResponse, NextCodeResponse, TerritoryCreate, TerritoryResponse
from src.api.v1.schemas.operations import OperationResponse, OperationTypeResponse
from src.api.v1.schemas.orders import OrderItemResponse, OrderResponse, OrderStatusResponse
from src.api.v1.schemas.reports import DashboardResponse, ReportEntryResponse
from src.api.v1.schemas.stock import StockItemResponse
from src.api.v1.schemas.users import UserPasswordSetResponse, UserResponse
from src.api.v1.schemas.visits import VisitResponse
from src.api.v1.schemas.warehouse import WarehouseStockResponse


@pytest.mark.parametrize(
    ("model_cls", "payload"),
    [
        (LoginRequest, {"login": "user", "password": "pass"}),
        (
            UserInfo,
            {
                "login": "admin",
                "fio": "Admin User",
                "role": "admin",
                "status": "active",
            },
        ),
        (
            LoginResponse,
            {
                "access_token": "token",
                "user": {
                    "login": "admin",
                    "fio": "Admin User",
                    "role": "admin",
                    "status": "active",
                },
            },
        ),
        (RuntimeConfigResponse, {"sentry_enabled": False}),
        (UserResponse, {"login": "u1", "fio": "User One", "role": "agent", "status": "active"}),
        (UserPasswordSetResponse, {}),
        (CustomerResponse, {"id": 1, "name_client": "Client"}),
        (CustomerVisitResponse, {"id": 1}),
        (CustomerBalanceResponse, {"customer_id": 1, "balance": 100.5}),
        (CustomerImportResponse, {"imported": 1, "skipped": 0, "errors": []}),
        (OrderResponse, {"id": 1}),
        (OrderItemResponse, {"id": 1}),
        (OrderStatusResponse, {"code": "open", "name": "Open"}),
        (OperationResponse, {"id": 1}),
        (OperationTypeResponse, {"code": "delivery", "name": "Delivery"}),
        (WarehouseStockResponse, {"warehouse_code": "WH1"}),
        (StockItemResponse, {"product_code": "P001"}),
        (EntityModel, {"any": "value"}),
        (MessageResponse, {"message": "ok"}),
        (IdResponse, {"id": 1}),
        (ErrorDetail, {"code": "E1", "message": "error"}),
        (ErrorResponse, {"error": {"code": "E1", "message": "error"}}),
        (VisitResponse, {"id": 1}),
        (ReportEntryResponse, {"metric": "m"}),
        (DashboardResponse, {"summary": "ok"}),
        (NextCodeResponse, {"next_code": 1}),
        (CityResponse, {"id": 1, "name": "Tashkent"}),
        (CityCreate, {"name": "Tashkent"}),
        (TerritoryResponse, {"id": 1, "name": "Center"}),
        (TerritoryCreate, {"name": "Center", "city_id": 1}),
    ],
)
def test_schema_payloads_validate(model_cls, payload) -> None:
    model = model_cls.model_validate(payload)
    assert model is not None


def test_city_create_rejects_empty_name() -> None:
    with pytest.raises(ValidationError):
        CityCreate.model_validate({"name": ""})


def test_territory_create_rejects_empty_name() -> None:
    with pytest.raises(ValidationError):
        TerritoryCreate.model_validate({"name": ""})
