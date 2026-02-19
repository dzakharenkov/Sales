"""Reporting schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ReportEntryResponse(BaseModel):
    model_config = ConfigDict(extra="allow", from_attributes=True)


class DashboardResponse(BaseModel):
    model_config = ConfigDict(extra="allow", from_attributes=True)
