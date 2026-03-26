"""
SwarLipi AI — Ingestion Task
Celery task for audio ingestion: file validation, normalization, and URL extraction.
"""

import logging
import tempfile
from pathlib import Path

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    name="ingest_audio",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
    acks_late=True,
)
def ingest_audio(self, project_id: str, source_type: str, source_value: str) -> dict:
    """Ingest audio from file path or URL.

    Pipeline Step 1: Takes raw input and produces a normalized 44.1kHz WAV.

    Args:
        project_id: UUID of the project.
        source_type: 'file_upload' or URL type.
        source_value: File path on disk or URL string.

    Returns:
        Dict with normalized_audio_path and metadata.
    """
    import asyncio
    from app.utils.audio import (
        normalize_audio,
        extract_audio_from_url,
        get_audio_metadata,
        cleanup_temp_files,
    )
    from app.utils.storage import storage_service
    from app.core.config import get_settings

    settings = get_settings()

    try:
        self.update_state(state="INGESTING", meta={"step": "Starting ingestion"})
        logger.info(f"[Project {project_id}] Starting ingestion: {source_type}")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        temp_files = []

        try:
            # Step 1: Get raw audio file
            if source_type == "file_upload":
                raw_audio_path = Path(source_value)
                if not raw_audio_path.exists():
                    raise FileNotFoundError(f"Uploaded file not found: {source_value}")
            else:
                # URL extraction (YouTube/Vimeo/Web)
                self.update_state(
                    state="INGESTING",
                    meta={"step": "Extracting audio from URL"},
                )
                raw_audio_path = loop.run_until_complete(
                    extract_audio_from_url(source_value)
                )
                temp_files.append(raw_audio_path.parent)

            # Step 2: Get metadata
            self.update_state(
                state="INGESTING",
                meta={"step": "Extracting audio metadata"},
            )
            metadata = loop.run_until_complete(get_audio_metadata(str(raw_audio_path)))

            # Validate duration
            duration = metadata.get("duration", 0)
            if duration > settings.max_audio_duration_seconds:
                raise ValueError(
                    f"Audio duration ({duration:.0f}s) exceeds maximum "
                    f"({settings.max_audio_duration_seconds}s)"
                )

            # Step 3: Normalize audio
            self.update_state(
                state="INGESTING",
                meta={"step": "Normalizing audio to 44.1kHz WAV"},
            )
            normalized_path = loop.run_until_complete(normalize_audio(raw_audio_path))
            temp_files.append(normalized_path)

            # Step 4: Upload to storage
            self.update_state(
                state="INGESTING",
                meta={"step": "Uploading to storage"},
            )
            storage_dest = f"{project_id}/raw_audio.wav"
            audio_bytes = normalized_path.read_bytes()
            storage_path = loop.run_until_complete(
                storage_service.upload_file(
                    audio_bytes,
                    settings.gcs_bucket_raw,
                    storage_dest,
                    content_type="audio/wav",
                )
            )

            logger.info(f"[Project {project_id}] Ingestion complete: {storage_path}")

            return {
                "project_id": project_id,
                "storage_path": storage_path,
                "duration_seconds": int(duration),
                "sample_rate": metadata.get("sample_rate", 44100),
                "channels": metadata.get("channels", 2),
                "status": "ingested",
            }

        finally:
            # Cleanup temp files
            cleanup_temp_files(*temp_files)
            loop.close()

    except Exception as exc:
        logger.error(f"[Project {project_id}] Ingestion failed: {exc}")
        self.update_state(
            state="FAILED",
            meta={"step": "Ingestion failed", "error": str(exc)},
        )
        raise self.retry(exc=exc) if self.request.retries < self.max_retries else exc
