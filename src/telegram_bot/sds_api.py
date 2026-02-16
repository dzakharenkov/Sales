"""
HTTP-клиент для SDS API. Все запросы бота к основной системе проходят здесь.
"""
import logging
from typing import Any

import httpx

from .config import SDS_API_URL, API_TIMEOUT

logger = logging.getLogger(__name__)


class SDSApiError(Exception):
    """Ошибка от SDS API."""
    def __init__(self, status: int, detail: str):
        self.status = status
        self.detail = detail
        super().__init__(f"SDS API {status}: {detail}")


class SDSApi:
    """Асинхронный клиент SDS API."""

    def __init__(self):
        self._client = httpx.AsyncClient(
            base_url=SDS_API_URL,
            timeout=API_TIMEOUT,
        )

    async def close(self):
        await self._client.aclose()

    # ---------- helpers ----------

    def _headers(self, token: str | None = None) -> dict:
        h = {"Content-Type": "application/json"}
        if token:
            h["Authorization"] = f"Bearer {token}"
        return h

    async def _request(self, method: str, url: str, token: str | None = None, **kwargs) -> Any:
        try:
            resp = await self._client.request(
                method, url, headers=self._headers(token), **kwargs
            )
        except httpx.TimeoutException:
            raise SDSApiError(0, "Таймаут соединения с сервером SDS")
        except httpx.ConnectError:
            raise SDSApiError(0, "Нет соединения с сервером SDS")

        if resp.status_code == 401:
            raise SDSApiError(401, "Сессия истекла")
        if resp.status_code == 403:
            detail = "Нет доступа"
            try:
                detail = resp.json().get("detail", detail)
            except Exception:
                pass
            raise SDSApiError(403, detail)
        if resp.status_code >= 400:
            detail = str(resp.status_code)
            try:
                d = resp.json()
                detail = d.get("detail", str(d)) if isinstance(d, dict) else str(d)
            except Exception:
                detail = resp.text[:300]
            raise SDSApiError(resp.status_code, detail)

        if resp.status_code == 204:
            return None
        try:
            return resp.json()
        except Exception:
            return resp.text

    # ---------- Auth ----------

    async def login(self, login: str, password: str) -> dict:
        """POST /api/v1/auth/login"""
        return await self._request(
            "POST", "/api/v1/auth/login",
            json={"login": login, "password": password},
        )

    async def me(self, token: str) -> dict:
        """GET /api/v1/auth/me"""
        return await self._request("GET", "/api/v1/auth/me", token=token)

    # ---------- Orders ----------

    async def get_orders(self, token: str, **params) -> Any:
        """GET /api/v1/orders"""
        return await self._request("GET", "/api/v1/orders", token=token, params=params)

    async def get_order(self, token: str, order_no: int) -> dict:
        """GET /api/v1/orders/{order_no}"""
        return await self._request("GET", f"/api/v1/orders/{order_no}", token=token)

    async def update_order(self, token: str, order_no: int, data: dict) -> dict:
        """PATCH /api/v1/orders/{order_no}"""
        return await self._request("PATCH", f"/api/v1/orders/{order_no}", token=token, json=data)

    async def create_order(self, token: str, data: dict) -> dict:
        """POST /api/v1/orders"""
        return await self._request("POST", "/api/v1/orders", token=token, json=data)

    async def add_order_item(self, token: str, order_no: int, item: dict) -> dict:
        """POST /api/v1/orders/{order_no}/items"""
        return await self._request("POST", f"/api/v1/orders/{order_no}/items", token=token, json=item)

    async def update_order_total(self, token: str, order_no: int, total: float) -> dict:
        """PATCH /api/v1/orders/{order_no} — обновить total_amount"""
        return await self._request("PATCH", f"/api/v1/orders/{order_no}", token=token, json={"total_amount": total})

    # ---------- Visits ----------

    async def search_visits(self, token: str, **params) -> dict:
        """GET /api/v1/visits/search"""
        return await self._request("GET", "/api/v1/visits/search", token=token, params=params)

    async def get_visit(self, token: str, visit_id: int) -> dict:
        """GET /api/v1/visits/{visit_id}"""
        return await self._request("GET", f"/api/v1/visits/{visit_id}", token=token)

    async def update_visit(self, token: str, visit_id: int, data: dict) -> dict:
        """PUT /api/v1/visits/{visit_id}"""
        return await self._request("PUT", f"/api/v1/visits/{visit_id}", token=token, json=data)

    async def create_visit(self, token: str, data: dict) -> dict:
        """POST /api/v1/visits"""
        return await self._request("POST", "/api/v1/visits", token=token, json=data)

    # ---------- Customers ----------

    async def search_customers(self, token: str, **params) -> list:
        """GET /api/v1/customers"""
        return await self._request("GET", "/api/v1/customers", token=token, params=params)

    async def get_customer(self, token: str, customer_id: int) -> dict:
        """GET /api/v1/customers/{id}"""
        return await self._request("GET", f"/api/v1/customers/{customer_id}", token=token)

    async def create_customer(self, token: str, data: dict) -> dict:
        """POST /api/v1/customers"""
        return await self._request("POST", "/api/v1/customers", token=token, json=data)

    async def update_customer(self, token: str, customer_id: int, data: dict) -> dict:
        """PATCH /api/v1/customers/{id}"""
        return await self._request("PATCH", f"/api/v1/customers/{customer_id}", token=token, json=data)

    # ---------- Photos ----------

    async def upload_photo(self, token: str, customer_id: int, file_bytes: bytes, filename: str) -> dict:
        """POST /api/v1/customers/{id}/photos (multipart)"""
        import io
        files = {"file": (filename, io.BytesIO(file_bytes), "image/jpeg")}
        resp = await self._client.post(
            f"/api/v1/customers/{customer_id}/photos",
            headers={"Authorization": f"Bearer {token}"},
            files=files,
            data={"is_main": "false"},
            timeout=30,
        )
        if resp.status_code >= 400:
            detail = str(resp.status_code)
            try:
                detail = resp.json().get("detail", detail)
            except Exception:
                detail = resp.text[:200]
            raise SDSApiError(resp.status_code, detail)
        return resp.json()

    async def get_customer_photos(self, token: str, customer_id: int) -> dict:
        """GET /api/v1/customers/{id}/photos"""
        return await self._request("GET", f"/api/v1/customers/{customer_id}/photos", token=token)

    async def delete_photo(self, token: str, photo_id: int) -> None:
        """DELETE /api/v1/photos/{photo_id}"""
        return await self._request("DELETE", f"/api/v1/photos/{photo_id}", token=token)

    # ---------- Dictionary ----------

    async def get_products(self, token: str) -> list:
        """GET /api/v1/dictionary/products"""
        return await self._request("GET", "/api/v1/dictionary/products", token=token)

    async def get_payment_types(self, token: str) -> list:
        """GET /api/v1/dictionary/payment-types"""
        return await self._request("GET", "/api/v1/dictionary/payment-types", token=token)

    # ---------- Operations ----------

    async def get_operations(self, token: str, **params) -> list:
        """GET /api/v1/operations"""
        return await self._request("GET", "/api/v1/operations", token=token, params=params)

    async def create_payment_receipt(
        self,
        token: str,
        order_id: int,
        customer_id: int,
        amount: float,
        payment_type_code: str,
        expeditor_login: str | None = None,
    ) -> dict:
        """POST /api/v1/operations/payment_receipt_from_customer/create — операция приёма платежа от клиента (сдача наличных)."""
        payload = {
            "order_id": order_id,
            "customer_id": customer_id,
            "amount": amount,
            "payment_type_code": payment_type_code or "cash",
        }
        if expeditor_login:
            payload["expeditor_login"] = expeditor_login
        return await self._request(
            "POST",
            "/api/v1/operations/payment_receipt_from_customer/create",
            token=token,
            json=payload,
        )


# Глобальный singleton
api = SDSApi()
