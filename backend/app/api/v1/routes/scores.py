"""
SwarLipi AI — Score API Route
Score retrieval, export, and editing endpoints.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import Settings, get_settings
from app.core.security import get_current_user_id
from app.db.session import get_db
from app.models import NotationType, Project, ProjectStatus
from app.schemas.score import ScoreEditRequest, ScoreEditResponse, ScoreResponse, WesternScoreData

router = APIRouter(prefix="/score", tags=["Scores"])


@router.get(
    "/{project_id}",
    response_model=ScoreResponse,
    summary="Get score data for rendering",
)
async def get_score(
    project_id: uuid.UUID,
    format: str = Query("musicxml", description="Score format: musicxml, json"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Retrieve the generated score for a project.

    Returns MusicXML for Western notation or JSON for Sargam notation,
    ready for the frontend renderer (Verovio/VexFlow).
    """
    query = (
        select(Project)
        .where(Project.id == project_id, Project.user_id == uuid.UUID(user_id))
        .options(selectinload(Project.stems))
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if project.status != ProjectStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Project is not ready. Current status: {project.status.value}",
        )

    # Load score data from storage
    from app.utils.storage import storage_service

    western_data = None
    if project.notation_type in (NotationType.WESTERN, NotationType.BOTH):
        if project.score_xml_path:
            try:
                xml_bytes = await storage_service.download_file(
                    settings.gcs_bucket_scores,
                    f"{project_id}/scores/full_mix.musicxml",
                )
                western_data = WesternScoreData(
                    music_xml=xml_bytes.decode("utf-8"),
                    metadata={
                        "tempo": project.detected_tempo,
                        "time_signature": project.detected_time_signature,
                        "key": project.detected_key,
                    },
                )
            except Exception:
                pass

    # Build stem information
    stems_data = []
    for stem in project.stems:
        stem_info = {
            "id": str(stem.id),
            "instrument": stem.instrument_type.value,
            "display_name": stem.display_name,
            "status": stem.status.value,
        }
        if stem.audio_path:
            stem_info["audio_url"] = await storage_service.get_signed_url(
                settings.gcs_bucket_stems,
                f"{project_id}/stems/{stem.instrument_type.value}.wav",
            )
        if stem.midi_path:
            stem_info["midi_url"] = await storage_service.get_signed_url(
                settings.gcs_bucket_scores,
                f"{project_id}/scores/{stem.instrument_type.value}.mid",
            )
        stems_data.append(stem_info)

    return ScoreResponse(
        project_id=project.id,
        status=project.status.value,
        notation_type=project.notation_type.value,
        western=western_data,
        stems=stems_data,
        metadata={
            "tempo": project.detected_tempo,
            "time_signature": project.detected_time_signature,
            "key": project.detected_key,
            "raga": project.detected_raga,
        },
    )


@router.get(
    "/{project_id}/export",
    summary="Export score in various formats",
)
async def export_score(
    project_id: uuid.UUID,
    format: str = Query(..., description="Export format: pdf, midi, musicxml, gp"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Export the score as PDF, MIDI, MusicXML, or Guitar Pro."""
    query = select(Project).where(
        Project.id == project_id,
        Project.user_id == uuid.UUID(user_id),
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.status != ProjectStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="Score not ready for export")

    from app.utils.storage import storage_service

    # Determine file to serve
    content_type_map = {
        "pdf": ("application/pdf", f"{project_id}/scores/full_mix.pdf"),
        "midi": ("audio/midi", f"{project_id}/scores/full_mix.mid"),
        "musicxml": ("application/xml", f"{project_id}/scores/full_mix.musicxml"),
        "gp": ("application/octet-stream", f"{project_id}/scores/full_mix.gp"),
    }

    if format not in content_type_map:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {format}. Supported: {', '.join(content_type_map.keys())}",
        )

    content_type, file_path = content_type_map[format]

    try:
        file_bytes = await storage_service.download_file(
            settings.gcs_bucket_scores,
            file_path,
        )
    except Exception:
        raise HTTPException(
            status_code=404,
            detail=f"Export file not available in {format} format",
        )

    filename = f"{project.title or 'score'}_{format}.{format}"

    import io
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=content_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.patch(
    "/{project_id}",
    response_model=ScoreEditResponse,
    summary="Save score corrections (Phase 4)",
)
async def edit_score(
    project_id: uuid.UUID,
    edit_request: ScoreEditRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Save manual user corrections to the AI-generated score.

    Phase 4 feature — uses optimistic locking via version numbers.
    """
    from datetime import datetime, timezone

    query = select(Project).where(
        Project.id == project_id,
        Project.user_id == uuid.UUID(user_id),
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # TODO: Phase 4 — Implement full note editing with CRDT support
    # For now, return acknowledgment
    return ScoreEditResponse(
        success=True,
        new_version=edit_request.version + 1,
        applied_edits=len(edit_request.edits),
        updated_at=datetime.now(timezone.utc),
    )
