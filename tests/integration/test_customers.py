from __future__ import annotations

import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.asyncio


async def test_customers_crud(client: AsyncClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}

    create_response = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "name_client": "Test Customer",
            "firm_name": "Test Firm",
            "phone": "+998900000000",
        },
    )
    assert create_response.status_code == 200, create_response.text
    created = create_response.json()
    customer_id = created["id"]

    get_response = await client.get(f"/api/v1/customers/{customer_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["id"] == customer_id

    update_response = await client.patch(
        f"/api/v1/customers/{customer_id}",
        headers=headers,
        json={"phone": "+998911111111"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["phone"] == "+998911111111"

    list_response = await client.get(
        "/api/v1/customers",
        headers=headers,
        params={"customer_id": customer_id, "limit": 10, "offset": 0},
    )
    assert list_response.status_code == 200
    payload = list_response.json()
    assert payload["total"] >= 1
    assert any(item["id"] == customer_id for item in payload["data"])

    delete_response = await client.delete(f"/api/v1/customers/{customer_id}", headers=headers)
    assert delete_response.status_code == 200
    assert delete_response.json()["id"] == customer_id
