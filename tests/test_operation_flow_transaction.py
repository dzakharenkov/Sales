from __future__ import annotations

from copy import deepcopy

import pytest

from src.api.v1.routers.operations_flow import (
    OperationFlowStep,
    execute_operation_flow_atomic,
)
from src.core.exceptions import ValidationError


class _FakeResult:
    def __init__(self, row=None, scalar_value=None):
        self._row = row
        self._scalar_value = scalar_value

    def mappings(self):
        return self

    def first(self):
        return self._row

    def scalar(self):
        return self._scalar_value


class _FakeTransaction:
    def __init__(self, session: "_FakeSession"):
        self._session = session
        self._snapshot_stock = None
        self._snapshot_operations = None

    async def __aenter__(self):
        self._snapshot_stock = deepcopy(self._session.stock)
        self._snapshot_operations = deepcopy(self._session.operations)
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if exc_type is not None:
            self._session.stock = self._snapshot_stock
            self._session.operations = self._snapshot_operations
            self._session.rolled_back = True
        else:
            self._session.committed = True
        return False


class _FakeSession:
    def __init__(self, stock_rows: dict[tuple[str, str], dict]):
        self.stock = deepcopy(stock_rows)
        self.operations: list[dict] = []
        self.calls: list[str] = []
        self.lock_order: list[tuple[str, str]] = []
        self.committed = False
        self.rolled_back = False
        self._op_no = 0

    def begin(self):
        return _FakeTransaction(self)

    async def execute(self, statement, params=None):
        sql = str(statement)
        self.calls.append(sql)
        params = params or {}

        if "generate_operation_number" in sql:
            self._op_no += 1
            return _FakeResult(scalar_value=f"OP-{self._op_no:06d}")

        if 'FROM "Sales".warehouse_stock' in sql and "FOR UPDATE" in sql:
            key = (params["warehouse_code"], params["product_code"])
            self.lock_order.append(key)
            return _FakeResult(row=self.stock.get(key))

        if 'INSERT INTO "Sales".operations' in sql:
            self.operations.append(deepcopy(params))
            return _FakeResult()

        if 'UPDATE "Sales".warehouse_stock' in sql:
            stock_id = params["stock_id"]
            for row in self.stock.values():
                if row["id"] == stock_id:
                    row["reserved_qty"] = int(row.get("reserved_qty") or 0) + int(params["quantity"])
                    break
            return _FakeResult()

        return _FakeResult()


@pytest.mark.asyncio
async def test_operation_flow_rolls_back_all_steps_on_failure() -> None:
    session = _FakeSession(
        {
            ("WH-1", "P-1"): {"id": 1, "quantity": 10, "reserved_qty": 0},
            ("WH-1", "P-2"): {"id": 2, "quantity": 1, "reserved_qty": 1},
        }
    )
    steps = [
        OperationFlowStep(type_code="allocation", warehouse_from="WH-1", product_code="P-1", quantity=3),
        OperationFlowStep(type_code="allocation", warehouse_from="WH-1", product_code="P-2", quantity=1),
    ]

    with pytest.raises(ValidationError):
        await execute_operation_flow_atomic(session=session, steps=steps, created_by="tester")

    assert session.rolled_back is True
    assert session.committed is False
    assert session.operations == []
    assert session.stock[("WH-1", "P-1")]["reserved_qty"] == 0


@pytest.mark.asyncio
async def test_operation_flow_locks_rows_in_stable_sorted_order() -> None:
    session = _FakeSession(
        {
            ("WH-2", "P-2"): {"id": 2, "quantity": 20, "reserved_qty": 0},
            ("WH-1", "P-1"): {"id": 1, "quantity": 20, "reserved_qty": 0},
        }
    )
    steps = [
        OperationFlowStep(type_code="allocation", warehouse_from="WH-2", product_code="P-2", quantity=3),
        OperationFlowStep(type_code="allocation", warehouse_from="WH-1", product_code="P-1", quantity=4),
    ]

    created = await execute_operation_flow_atomic(session=session, steps=steps, created_by="tester")

    assert session.committed is True
    assert session.rolled_back is False
    assert len(created) == 2
    assert session.lock_order == [("WH-1", "P-1"), ("WH-2", "P-2")]
