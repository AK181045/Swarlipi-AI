"""
SwarLipi AI — Projects API Route
CRUD operations for user projects.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.models import Project, ProjectStatus
from app.schemas.project import (
    ProjectListResponse,
    ProjectResponse,
    ProjectStatusResponse,
    ProjectUpdateRequest,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get(
    "",
    response_model=ProjectListResponse,
    summary="List user's projects",
)
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: ProjectStatus | None = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of the current user's projects."""
    user_uuid = uuid.UUID(user_id)

    # Build query
    query = select(Project).where(Project.user_id == user_uuid)
    count_query = select(func.count()).select_from(Project).where(Project.user_id == user_uuid)

    if status_filter:
        query = query.where(Project.status == status_filter)
        count_query = count_query.where(Project.status == status_filter)

    # Get total count
    total = await db.scalar(count_query)

    # Apply pagination and ordering
    query = (
        query
        .options(selectinload(Project.stems))
        .order_by(Project.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    projects = result.scalars().all()

    return ProjectListResponse(
        projects=[ProjectResponse.model_validate(p) for p in projects],
        total=total or 0,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get project details",
)
async def get_project(
    project_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific project."""
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

    return ProjectResponse.model_validate(project)


@router.get(
    "/{project_id}/status",
    response_model=ProjectStatusResponse,
    summary="Get project processing status",
)
async def get_project_status(
    project_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Lightweight status endpoint for polling during processing."""
    query = select(Project).where(
        Project.id == project_id,
        Project.user_id == uuid.UUID(user_id),
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Calculate progress percentage based on status
    progress_map = {
        ProjectStatus.PENDING: 0,
        ProjectStatus.INGESTING: 10,
        ProjectStatus.INGESTED: 20,
        ProjectStatus.SEPARATING: 35,
        ProjectStatus.SEPARATED: 50,
        ProjectStatus.TRANSCRIBING: 65,
        ProjectStatus.TRANSCRIBED: 80,
        ProjectStatus.MAPPING: 90,
        ProjectStatus.COMPLETED: 100,
        ProjectStatus.FAILED: 0,
    }

    step_names = {
        ProjectStatus.PENDING: "Waiting in queue...",
        ProjectStatus.INGESTING: "Extracting & normalizing audio...",
        ProjectStatus.INGESTED: "Audio ready for processing",
        ProjectStatus.SEPARATING: "Separating instrument stems...",
        ProjectStatus.SEPARATED: "Stems ready for transcription",
        ProjectStatus.TRANSCRIBING: "AI transcribing notes...",
        ProjectStatus.TRANSCRIBED: "Notes transcribed",
        ProjectStatus.MAPPING: "Generating notation...",
        ProjectStatus.COMPLETED: "Score ready!",
        ProjectStatus.FAILED: "Processing failed",
    }

    return ProjectStatusResponse(
        id=project.id,
        status=project.status,
        error_message=project.error_message,
        progress_percent=progress_map.get(project.status, 0),
        current_step=step_names.get(project.status, ""),
    )


@router.patch(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update project metadata",
)
async def update_project(
    project_id: uuid.UUID,
    update: ProjectUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update project title or notation type."""
    query = select(Project).where(
        Project.id == project_id,
        Project.user_id == uuid.UUID(user_id),
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if update.title is not None:
        project.title = update.title
    if update.notation_type is not None:
        project.notation_type = update.notation_type

    await db.commit()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project",
)
async def delete_project(
    project_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a project and all associated data."""
    query = select(Project).where(
        Project.id == project_id,
        Project.user_id == uuid.UUID(user_id),
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    await db.delete(project)
    await db.commit()
