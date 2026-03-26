"""
SwarLipi AI — Pydantic Schemas for Projects
Request/response validation and serialization.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.project import NotationType, ProjectStatus, SourceType


# ──────────────────── Request Schemas ────────────────────


class TranscribeRequest(BaseModel):
    """Request body for POST /api/v1/transcribe."""

    source_type: SourceType = Field(
        ...,
        description="How the audio is provided: file_upload or url",
    )
    url: str | None = Field(
        None,
        description="YouTube/Vimeo/Web URL (required if source_type is a URL type)",
    )
    title: str = Field(
        "Untitled Project",
        max_length=255,
        description="User-provided project title",
    )
    notation_type: NotationType = Field(
        NotationType.WESTERN,
        description="Desired notation format: western, sargam, or both",
    )
    separate_stems: bool = Field(
        False,
        description="Whether to perform multi-instrument stem separation (Phase 2+)",
    )
    target_instruments: list[str] = Field(
        default_factory=lambda: ["vocals", "drums", "bass", "piano", "guitar", "other"],
        description="Which instruments to separate and transcribe",
    )


class ProjectUpdateRequest(BaseModel):
    """Request body for updating a project."""

    title: str | None = Field(None, max_length=255)
    notation_type: NotationType | None = None


# ──────────────────── Response Schemas ────────────────────


class StemResponse(BaseModel):
    """Serialized stem data for API responses."""

    id: uuid.UUID
    instrument_type: str
    status: str
    display_name: str
    audio_url: str | None = None
    midi_url: str | None = None
    musicxml_url: str | None = None
    waveform_url: str | None = None
    sargam_url: str | None = None
    tabla_bol_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectResponse(BaseModel):
    """Serialized project data for API responses."""

    id: uuid.UUID
    title: str
    source_type: SourceType
    source_url: str | None = None
    source_filename: str | None = None
    status: ProjectStatus
    error_message: str | None = None
    notation_type: NotationType
    duration_seconds: int | None = None
    detected_tempo: int | None = None
    detected_key: str | None = None
    detected_time_signature: str | None = None
    detected_raga: str | None = None
    score_xml_url: str | None = None
    score_midi_url: str | None = None
    score_pdf_url: str | None = None
    stems: list[StemResponse] = []
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    """Paginated list of projects."""

    projects: list[ProjectResponse]
    total: int
    page: int
    page_size: int


class ProjectStatusResponse(BaseModel):
    """Lightweight status-only response for polling."""

    id: uuid.UUID
    status: ProjectStatus
    error_message: str | None = None
    progress_percent: int = 0
    current_step: str = ""
