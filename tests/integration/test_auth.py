from __future__ import annotations

import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.asyncio


async def test_login_success(client: AsyncClient, admin_user: dict[str, str]) -> None:
    response = await client.post("/api/v1/auth/login", json=admin_user)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["login"] == admin_user["login"]
    assert "password" not in data["user"]


async def test_login_wrong_password(client: AsyncClient, admin_user: dict[str, str]) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"login": admin_user["login"], "password": "wrong-password"},
    )
    assert response.status_code == 401


async def test_me_authenticated(client: AsyncClient, admin_token: str) -> None:
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["login"].startswith("test_admin_")


async def test_me_unauthenticated(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


async def test_config_authenticated(client: AsyncClient, admin_token: str) -> None:
    response = await client.get(
        "/api/v1/config",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert "yandexMapsApiKey" in response.json()
