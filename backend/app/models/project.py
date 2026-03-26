"""
SwarLipi AI — Project Model
Represents a transcription project from upload through processing to completion.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ProjectStatus(str, PyEnum):
    """Processing status of a project through the pipeline."""
    PENDING = "pending"
    INGESTING = "ingesting"
    INGESTED = "ingested"
    SEPARATING = "separating"
    SEPARATED = "separated"
    TRANSCRIBING = "transcribing"
    TRANSCRIBED = "transcribed"
    MAPPING = "mapping"
    COMPLETED = "completed"
    FAILED = "failed"


class SourceType(str, PyEnum):
    """How the audio was provided."""
    FILE_UPLOAD = "file_upload"
    YOUTUBE_URL = "youtube_url"
    VIMEO_URL = "vimeo_url"
    WEB_URL = "web_url"


class NotationType(str, PyEnum):
    """Notation format requested."""
    WESTERN = "western"
    SARGAM = "sargam"
    BOTH = "both"


class Project(Base):
    """A music transcription project."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Untitled Project",
    )
    source_type: Mapped[SourceType] = mapped_column(
        Enum(SourceType),
        nullable=False,
    )
    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    source_filename: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus),
        default=ProjectStatus.PENDING,
        nullable=False,
        index=True,
    )
    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    notation_type: Mapped[NotationType] = mapped_column(
        Enum(NotationType),
        default=NotationType.WESTERN,
        nullable=False,
    )

    # Audio metadata
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sample_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # GCS paths
    raw_audio_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    score_xml_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    score_midi_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    score_pdf_path: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Music metadata (populated by AI)
    detected_tempo: Mapped[int | None] = mapped_column(Integer, nullable=True)
    detected_key: Mapped[str | None] = mapped_column(String(50), nullable=True)
    detected_time_signature: Mapped[str | None] = mapped_column(String(20), nullable=True)
    detected_raga: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Celery task tracking
    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

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
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    user = relationship("User", back_populates="projects")
    stems = relationship("Stem", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, status={self.status}, title={self.title})>"
