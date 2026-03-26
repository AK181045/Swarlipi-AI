"""
SwarLipi AI — Stem Model
Represents a separated instrument stem within a project.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class InstrumentType(str, PyEnum):
    """Types of instruments/stems produced by source separation."""
    VOCALS = "vocals"
    DRUMS = "drums"
    BASS = "bass"
    PIANO = "piano"
    GUITAR = "guitar"
    OTHER = "other"  # Sitar, Sarangi, Flute, Strings, Woodwinds etc.


class StemStatus(str, PyEnum):
    """Processing status of an individual stem."""
    PENDING = "pending"
    SEPARATING = "separating"
    SEPARATED = "separated"
    TRANSCRIBING = "transcribing"
    TRANSCRIBED = "transcribed"
    COMPLETED = "completed"
    FAILED = "failed"


class Stem(Base):
    """An individual instrument stem extracted from a project's audio."""

    __tablename__ = "stems"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    instrument_type: Mapped[InstrumentType] = mapped_column(
        Enum(InstrumentType),
        nullable=False,
    )
    status: Mapped[StemStatus] = mapped_column(
        Enum(StemStatus),
        default=StemStatus.PENDING,
        nullable=False,
    )
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Unknown",
    )

    # GCS file paths
    audio_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    midi_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    musicxml_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    waveform_data_path: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Sargam-specific (Phase 3)
    sargam_json_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    tabla_bol_path: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Error tracking
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    project = relationship("Project", back_populates="stems")

    def __repr__(self) -> str:
        return f"<Stem(id={self.id}, instrument={self.instrument_type}, status={self.status})>"
