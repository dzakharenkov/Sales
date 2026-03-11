from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from telegram.error import NetworkError

from src.telegram_bot import handlers_agent, handlers_auth
from src.core import notifications
from src.telegram_bot import bot as telegram_bot
from src.telegram_bot import handlers_expeditor
from src.api.v1.routers import operations


@pytest.mark.asyncio
async def test_show_main_menu_force_reply_uses_new_message(monkeypatch) -> None:
    async def fake_t(update, context, key, **params):
        if key == "telegram.menu.main":
            return "Main"
        if key == "telegram.menu.main_text":
            return f"{params['title']} | {params['fio']} | {params['role']}"
        return key

    monkeypatch.setattr(handlers_auth, "t", fake_t)
    monkeypatch.setattr(handlers_auth, "_role_label", AsyncMock(return_value="Agent"))
    monkeypatch.setattr(handlers_auth, "main_menu_keyboard", AsyncMock(return_value="keyboard"))

    effective_message = SimpleNamespace(reply_text=AsyncMock())
    callback_query = SimpleNamespace(edit_message_text=AsyncMock())
    update = SimpleNamespace(callback_query=callback_query, effective_message=effective_message)
    session = SimpleNamespace(role="agent", fio="Test User")

    await handlers_auth.show_main_menu(update, SimpleNamespace(), session, force_reply=True)

    effective_message.reply_text.assert_awaited_once()
    callback_query.edit_message_text.assert_not_called()


@pytest.mark.asyncio
async def test_agent_order_confirm_sets_scheduled_delivery_for_today(monkeypatch) -> None:
    session = SimpleNamespace(login="agent1", role="agent")
    create_order_mock = AsyncMock(return_value={"order_no": 42})
    add_item_mock = AsyncMock()
    update_total_mock = AsyncMock()
    get_customer_mock = AsyncMock(return_value={"name_client": "Client", "tax_id": "123456789"})

    monkeypatch.setattr(handlers_agent, "_get_auth", AsyncMock(return_value=(session, "token")))
    monkeypatch.setattr(handlers_agent, "log_action", AsyncMock())
    monkeypatch.setattr(handlers_agent, "t", AsyncMock(return_value="Main menu"))
    monkeypatch.setattr(
        handlers_agent,
        "api",
        SimpleNamespace(
            create_order=create_order_mock,
            add_order_item=add_item_mock,
            update_order_total=update_total_mock,
            get_customer=get_customer_mock,
        ),
    )

    callback_query = SimpleNamespace(
        answer=AsyncMock(),
        edit_message_text=AsyncMock(),
        from_user=SimpleNamespace(id=1001),
    )
    update = SimpleNamespace(callback_query=callback_query)
    context = SimpleNamespace(
        user_data={
            "order_customer_id": 7,
            "order_cart": [{"product_code": "P1", "name": "Product", "qty": 2, "price": 10.0}],
            "order_payment": "cash",
        }
    )

    await handlers_agent.cb_agent_order_confirm(update, context)

    create_order_mock.assert_awaited_once()
    payload = create_order_mock.await_args.args[1]
    assert payload["customer_id"] == 7
    assert payload["scheduled_delivery_at"] == handlers_agent.date.today().isoformat()


@pytest.mark.asyncio
async def test_get_user_language_falls_back_when_column_missing(monkeypatch) -> None:
    notifications._user_language_column_exists = None

    class _Result:
        def __init__(self, value):
            self._value = value

        def scalar(self):
            return self._value

    class _Session:
        async def execute(self, *_args, **_kwargs):
            return _Result(False)

    class _SessionCtx:
        async def __aenter__(self):
            return _Session()

        async def __aexit__(self, exc_type, exc, tb):
            return False

    monkeypatch.setattr(notifications, "async_session", lambda: _SessionCtx())

    lang = await notifications._get_user_language("agent1")

    assert lang == "ru"


@pytest.mark.asyncio
async def test_on_bot_error_ignores_transient_network_error() -> None:
    application = SimpleNamespace(stop_running=AsyncMock(), stop=AsyncMock())
    context = SimpleNamespace(error=NetworkError("Bad Gateway"), application=application)

    await telegram_bot.on_bot_error(None, context)

    application.stop_running.assert_not_called()
    application.stop.assert_not_called()


def test_product_label_includes_code_when_name_differs() -> None:
    assert operations._product_label("7", "Йогурт клубничный") == "Йогурт клубничный (код 7)"


def test_list_payload_extracts_paginated_data() -> None:
    payload = {"data": [{"order_id": 31}], "total": 1, "limit": 50, "offset": 0, "has_more": False}
    assert handlers_expeditor._list_payload(payload) == [{"order_id": 31}]


@pytest.mark.asyncio
async def test_expeditor_get_auth_handles_missing_session_without_context(monkeypatch) -> None:
    callback_query = SimpleNamespace(
        from_user=SimpleNamespace(id=501),
        edit_message_text=AsyncMock(),
    )
    update = SimpleNamespace(callback_query=callback_query)

    monkeypatch.setattr(handlers_expeditor, "get_session", AsyncMock(return_value=None))
    monkeypatch.setattr(handlers_expeditor, "touch_session", AsyncMock())

    session, token = await handlers_expeditor._get_auth(update)

    assert session is None
    assert token is None
    callback_query.edit_message_text.assert_awaited_once_with("Сессия истекла. Нажмите /start.")


@pytest.mark.asyncio
async def test_expeditor_delivered_ignores_non_dict_operations(monkeypatch) -> None:
    session = SimpleNamespace(login="expeditor1", role="expeditor")
    callback_query = SimpleNamespace(
        data="exp_delivered_42",
        from_user=SimpleNamespace(id=777),
        answer=AsyncMock(),
        edit_message_text=AsyncMock(),
    )
    update = SimpleNamespace(callback_query=callback_query)
    context = SimpleNamespace(user_data={})

    get_order_mock = AsyncMock(
        return_value={
            "status_code": "delivery",
            "warehouse_from": "WH-1",
            "customer_id": 9,
            "payment_type_code": "cash",
            "items": [
                {"product_code": "P1", "quantity": 2, "price": 15.0, "product_name": "Milk"},
            ],
        }
    )
    get_operations_mock = AsyncMock(return_value={"data": ["bad-row", {"order_id": 77, "status": "pending"}]})
    get_stock_mock = AsyncMock(
        return_value={
            "data": [
                {"product_code": "P1", "batch_code": "B1", "total_qty": 5, "expiry_date": "2026-03-31"},
            ]
        }
    )
    create_delivery_mock = AsyncMock()
    update_order_mock = AsyncMock()
    show_main_menu_mock = AsyncMock()

    monkeypatch.setattr(handlers_expeditor, "_get_auth", AsyncMock(return_value=(session, "token")))
    monkeypatch.setattr(handlers_expeditor, "_loc", AsyncMock(return_value="processing"))
    monkeypatch.setattr(handlers_expeditor, "log_action", AsyncMock())
    monkeypatch.setattr(
        handlers_expeditor,
        "api",
        SimpleNamespace(
            get_order=get_order_mock,
            get_operations=get_operations_mock,
            get_warehouse_stock=get_stock_mock,
            create_delivery_operation=create_delivery_mock,
            update_order=update_order_mock,
        ),
    )
    monkeypatch.setattr(handlers_auth, "show_main_menu", show_main_menu_mock)

    await handlers_expeditor.cb_exp_delivered(update, context)

    create_delivery_mock.assert_awaited_once()
    update_order_mock.assert_awaited_once_with("token", 42, {"status_code": "completed"})
    show_main_menu_mock.assert_awaited_once()
    assert "exp_delivered_in_progress_42" not in context.user_data
