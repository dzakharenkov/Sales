from __future__ import annotations

import asyncio

import pytest

from src.core import notifications


@pytest.mark.asyncio
async def test_notify_new_order_formats_message(monkeypatch) -> None:
    captured = {}

    async def fake_send(login: str | None, message: str) -> bool:
        captured["login"] = login
        captured["message"] = message
        return True

    monkeypatch.setattr(notifications, "send_notification", fake_send)

    ok = await notifications.notify_new_order(
        order_no=101,
        customer_name="ООО Тест",
        total_amount=120000,
        scheduled_delivery_at="2026-02-20",
        expeditor_login="exp1",
    )

    assert ok is True
    assert captured["login"] == "exp1"
    assert "#101" in captured["message"]
    assert "ООО Тест" in captured["message"]


@pytest.mark.asyncio
async def test_notify_order_status_changed_formats_message(monkeypatch) -> None:
    captured = {}

    async def fake_send(login: str | None, message: str) -> bool:
        captured["login"] = login
        captured["message"] = message
        return True

    monkeypatch.setattr(notifications, "send_notification", fake_send)

    ok = await notifications.notify_order_status_changed(
        order_no=202,
        customer_name="ИП Клиент",
        total_amount=1000,
        agent_login="agent1",
        new_status="completed",
    )

    assert ok is True
    assert captured["login"] == "agent1"
    assert "Заказ доставлен" in captured["message"]


@pytest.mark.asyncio
async def test_schedule_notification_runs_in_background() -> None:
    marker = {"done": False}

    async def _job() -> None:
        marker["done"] = True

    notifications.schedule_notification(_job())
    await asyncio.sleep(0.05)
    assert marker["done"] is True
