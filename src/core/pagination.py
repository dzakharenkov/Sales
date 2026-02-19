"""Pagination primitives shared by list API endpoints."""

from __future__ import annotations

from typing import Generic, TypeVar

from fastapi import Query
from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams:
    """Validated pagination query params."""

    def __init__(
        self,
        limit: int = Query(default=50, ge=1, le=200, description="Results per page"),
        offset: int = Query(default=0, ge=0, description="Number of records to skip"),
    ) -> None:
        self.limit = limit
        self.offset = offset


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated response envelope."""

    data: list[T]
    total: int
    limit: int
    offset: int
    has_more: bool

    @classmethod
    def create(
        cls,
        data: list[T],
        total: int,
        pagination: PaginationParams,
    ) -> "PaginatedResponse[T]":
        return cls(
            data=data,
            total=total,
            limit=pagination.limit,
            offset=pagination.offset,
            has_more=(pagination.offset + pagination.limit) < total,
        )
