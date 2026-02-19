from __future__ import annotations

import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.asyncio


async def test_admin_endpoint_requires_admin(client: AsyncClient, agent_token: str) -> None:
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {agent_token}"},
    )
    assert response.status_code == 403


async def test_admin_can_access_admin_endpoint(client: AsyncClient, admin_token: str) -> None:
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
