"""
SwarLipi AI — Pydantic Schemas for Raga Lookup (Phase 3)
"""

from pydantic import BaseModel, Field


class RagaLookupRequest(BaseModel):
    """Query parameters for raga lookup."""

    name: str | None = Field(None, description="Raga name to search for")
    thaat: str | None = Field(None, description="Filter by Thaat (Hindustani)")
    melakarta: int | None = Field(None, description="Filter by Melakarta number (Carnatic)")


class RagaDetail(BaseModel):
    """Full raga information."""

    id: int
    name: str
    aliases: list[str] = []
    thaat: str | None = None
    melakarta: int | None = None
    aroha: str = ""
    avaroha: str = ""
    pakad: str | None = None
    vadi: str | None = Field(None, description="Most important note")
    samvadi: str | None = Field(None, description="Second most important note")
    time_of_day: str | None = None
    mood: str | None = None
    scale_western: list[str] = Field(default_factory=list, description="Western note equivalents")
    scale_sargam: list[str] = Field(default_factory=list, description="Sargam note sequence")


class RagaListResponse(BaseModel):
    """Response for raga lookup queries."""

    ragas: list[RagaDetail]
    total: int
