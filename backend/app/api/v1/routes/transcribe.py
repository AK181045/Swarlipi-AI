"""
SwarLipi AI — Transcription API Route
POST /api/v1/transcribe — Main entry point for audio processing.
"""

import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import Settings, get_settings
from app.core.security import get_current_user_id
from app.db.session import get_db
from app.models import NotationType, Project, ProjectStatus, SourceType
from app.schemas.project import ProjectResponse, TranscribeRequest
from app.utils.audio import SUPPORTED_FORMATS, validate_file_extension

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transcribe", tags=["Transcription"])


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Start a new transcription project",
    description="Upload an audio file or provide a URL to begin transcription.",
)
async def create_transcription(
    background_tasks: BackgroundTasks,
    file: UploadFile | None = File(None),
    url: str | None = Form(None),
    title: str = Form("Untitled Project"),
    source_type: str = Form("file_upload"),
    notation_type: str = Form("western"),
    separate_stems: bool = Form(False),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Create a new transcription project.

    Accepts either:
    - A file upload (mp3, wav, flac, mp4)
    - A URL (YouTube, Vimeo, or web audio URL)
    """
    # Validate input
    if source_type == "file_upload" and file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is required for file_upload source type",
        )
    if source_type != "file_upload" and not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL is required for URL source types",
        )

    # Process file upload
    source_filename = None
    file_save_path = None
    project_id = uuid.uuid4()

    if file is not None:
        # Validate file extension
        if not validate_file_extension(file.filename or ""):
            supported = ", ".join(sorted(SUPPORTED_FORMATS))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format. Supported: {supported}",
            )

        # Validate file size
        if file.size and file.size > settings.max_upload_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum of {settings.max_upload_size_mb}MB",
            )

        # Save uploaded file temporarily
        upload_dir = settings.upload_path / str(project_id)
        upload_dir.mkdir(parents=True, exist_ok=True)

        source_filename = file.filename
        file_extension = Path(file.filename).suffix
        file_save_path = upload_dir / f"original{file_extension}"

        content = await file.read()
        file_save_path.write_bytes(content)

        logger.info(f"File saved: {file_save_path} ({len(content)} bytes)")

    # Map source_type string to enum
    source_type_enum = SourceType(source_type)
    notation_type_enum = NotationType(notation_type)

    # Create project record in database
    project = Project(
        id=project_id,
        user_id=uuid.UUID(user_id),
        title=title or f"Project {str(project_id)[:8]}",
        source_type=source_type_enum,
        source_url=url,
        source_filename=source_filename,
        status=ProjectStatus.INGESTING,
        notation_type=notation_type_enum,
    )
    db.add(project)
    await db.commit()

    logger.info(f"Project {project_id} created in database")

    # Launch ingestion in background
    from app.tasks.ingestion_task import ingest_audio_sync

    source_value = str(file_save_path) if file_save_path else url
    background_tasks.add_task(
        ingest_audio_sync,
        project_id=str(project_id),
        source_type=source_type,
        source_value=source_value,
    )

    logger.info(f"Project {project_id} — background ingestion scheduled")

    # Re-fetch the project with all relationships loaded for safe serialization
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.stems))
    )
    project_final = result.scalar_one()

    return ProjectResponse.model_validate(project_final)
