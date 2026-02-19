from __future__ import annotations

import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.asyncio


async def test_orders_crud(client: AsyncClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}

    create_response = await client.post(
        "/api/v1/orders",
        headers=headers,
        json={},
    )
    assert create_response.status_code == 200, create_response.text
    created = create_response.json()
    order_no = created["order_no"]

    get_response = await client.get(f"/api/v1/orders/{order_no}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["order_no"] == order_no

    update_response = await client.patch(
        f"/api/v1/orders/{order_no}",
        headers=headers,
        json={"total_amount": 123.45},
    )
    assert update_response.status_code == 200

    list_response = await client.get(
        "/api/v1/orders",
        headers=headers,
        params={"order_no": order_no, "limit": 10, "offset": 0},
    )
    assert list_response.status_code == 200
    payload = list_response.json()
    assert payload["total"] >= 1
    assert any(item["order_no"] == order_no for item in payload["data"])
