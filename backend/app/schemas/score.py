"""
SwarLipi AI — Pydantic Schemas for Score/Notation
Request/response validation for score retrieval and editing.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# ──────────────────── Score Retrieval ────────────────────


class NoteData(BaseModel):
    """A single note in the score."""

    pitch: str = Field(..., description="Note pitch (e.g., 'C4', 'D#5')")
    duration: float = Field(..., description="Duration in beats")
    start_time: float = Field(..., description="Start time in beats")
    velocity: int = Field(80, ge=0, le=127, description="MIDI velocity")
    voice: int = Field(1, description="Voice number for polyphonic parts")


class MeasureData(BaseModel):
    """A measure/bar in the score."""

    number: int
    notes: list[NoteData] = []
    time_signature: str | None = None
    key_signature: str | None = None
    tempo: int | None = None


class WesternScoreData(BaseModel):
    """Western notation score data."""

    music_xml: str = Field(..., description="Full MusicXML content")
    metadata: dict = Field(
        default_factory=dict,
        description="Tempo, time signature, key, etc.",
    )


class SargamNoteData(BaseModel):
    """A single note in Sargam notation."""

    beat: float
    note: str = Field(..., description="Sargam syllable: Sa, Re, Ga, Ma, Pa, Dha, Ni")
    octave: str = Field("middle", description="lower, middle, upper")
    modifier: str | None = Field(None, description="komal, tivra, or None (shuddh)")
    ornament: str | None = Field(None, description="meend, gamaka, kan, etc.")
    duration: float = 1.0


class RagaInfo(BaseModel):
    """Detected raga information."""

    name: str
    thaat: str | None = None
    melakarta: int | None = None
    aroha: str = ""
    avaroha: str = ""
    pakad: str | None = None
    time_of_day: str | None = None
    mood: str | None = None


class SargamScoreData(BaseModel):
    """Indian classical notation score data."""

    notes: list[SargamNoteData] = []
    raga: RagaInfo | None = None
    taal: str | None = Field(None, description="Rhythmic cycle: Teentaal, Rupak, etc.")


class ScoreResponse(BaseModel):
    """Full score response combining all notation types."""

    project_id: uuid.UUID
    status: str
    notation_type: str
    western: WesternScoreData | None = None
    sargam: SargamScoreData | None = None
    stems: list[dict] = []
    metadata: dict = Field(default_factory=dict)


# ──────────────────── Score Editing (Phase 4) ────────────────────


class NoteEdit(BaseModel):
    """A single note edit operation."""

    action: str = Field(..., description="add, delete, or modify")
    measure_number: int
    note_index: int | None = None  # For modify/delete
    note_data: NoteData | None = None  # For add/modify


class ScoreEditRequest(BaseModel):
    """Request to edit a score."""

    stem_id: uuid.UUID | None = None
    edits: list[NoteEdit] = []
    version: int = Field(..., description="Optimistic locking version")


class ScoreEditResponse(BaseModel):
    """Response after applying score edits."""

    success: bool
    new_version: int
    applied_edits: int
    updated_at: datetime
