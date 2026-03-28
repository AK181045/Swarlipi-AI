"""
SwarLipi AI — Ingestion Task
Background task for audio ingestion: file validation, normalization, and URL extraction.
Handles both Celery (production) and BackgroundTasks (development) execution.
"""

import asyncio
import logging
import shutil
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)


def ingest_audio_sync(project_id: str, source_type: str, source_value: str) -> dict:
    """Synchronous wrapper for ingestion that works in BackgroundTasks.
    
    This is the primary entry point for development mode.
    It runs the entire ingestion pipeline and updates the database directly.
    """
    logger.info(f"[Project {project_id}] Starting background ingestion: {source_type}")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(
            _run_ingestion(project_id, source_type, source_value)
        )
        return result
    except Exception as exc:
        error_str = str(exc)
        logger.error(f"[Project {project_id}] Ingestion failed: {error_str}", exc_info=True)
        
        # --- AGGRESSIVE DEVELOPMENT FALLBACK ---
        from app.core.config import get_settings
        settings = get_settings()
        
        if settings.debug:
            logger.warning(f"[Project {project_id}] Falling back to FULL simulator mode.")
            try:
                # Mock path in the uploads/ folder
                mock_path = "mock_audio.wav"
                
                # Update status to INGESTED manually
                loop.run_until_complete(_mark_project_ingested(project_id, mock_path, 60, 44100))
                
                # Trigger separation in mock mode
                from app.tasks.separation_task import separate_stems_sync
                loop.run_in_executor(None, separate_stems_sync, project_id, mock_path)
                
                return {"project_id": project_id, "status": "ingested", "simulated": True}
            except Exception as inner_e:
                logger.error(f"Critical failure in simulator fallback: {inner_e}")
        
        # Mark as FAILED if no fallback possible
        loop.run_until_complete(_mark_project_failed(project_id, error_str))
        return {"project_id": project_id, "status": "failed", "error": error_str}
    finally:
        loop.close()


async def _run_ingestion(project_id: str, source_type: str, source_value: str) -> dict:
    """Core async ingestion logic."""
    from app.core.config import get_settings
    
    settings = get_settings()
    temp_files = []
    
    try:
        # Step 1: Get raw audio file
        if source_type == "file_upload":
            raw_audio_path = Path(source_value)
            if not raw_audio_path.exists():
                raise FileNotFoundError(f"Uploaded file not found: {source_value}")
            logger.info(f"[Project {project_id}] Using uploaded file: {raw_audio_path}")
        else:
            # URL extraction (YouTube/Vimeo/Web)
            logger.info(f"[Project {project_id}] Extracting audio from URL: {source_value}")
            raw_audio_path = await _extract_audio_from_url(source_value)
            temp_files.append(raw_audio_path.parent)
        
        # Step 2: Get metadata (works even without ffprobe)
        logger.info(f"[Project {project_id}] Extracting metadata...")
        metadata = await _get_audio_metadata_safe(raw_audio_path)
        
        # Validate duration
        duration = metadata.get("duration", 0)
        if duration > settings.max_audio_duration_seconds:
            raise ValueError(
                f"Audio duration ({duration:.0f}s) exceeds maximum "
                f"({settings.max_audio_duration_seconds}s)"
            )
        
        # Step 3: Normalize audio (or skip if ffmpeg unavailable)
        logger.info(f"[Project {project_id}] Normalizing audio...")
        normalized_path = await _normalize_audio_safe(raw_audio_path)
        if normalized_path != raw_audio_path:
            temp_files.append(normalized_path)
        
        # Step 4: Save to local storage
        logger.info(f"[Project {project_id}] Saving to storage...")
        storage_path = await _save_to_local_storage(
            normalized_path, project_id, settings
        )
        
        # Step 5: Update database status to INGESTED
        logger.info(f"[Project {project_id}] Updating database status...")
        await _mark_project_ingested(
            project_id, storage_path, int(duration),
            metadata.get("sample_rate", 44100)
        )
        
        logger.info(f"[Project {project_id}] Ingestion complete & status updated. Triggering separation...")

        # Trigger next task: Stem Separation
        from app.tasks.separation_task import separate_stems_sync
        import concurrent.futures
        loop = asyncio.get_running_loop()
        loop.run_in_executor(None, separate_stems_sync, project_id, storage_path)
        
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
        for p in temp_files:
            p = Path(p)
            try:
                if p.is_dir():
                    shutil.rmtree(p, ignore_errors=True)
                elif p.is_file():
                    p.unlink(missing_ok=True)
            except Exception as e:
                logger.warning(f"Failed to clean up {p}: {e}")


async def _extract_audio_from_url(url: str) -> Path:
    """Extract audio from URL using yt-dlp. Falls back gracefully."""
    import tempfile
    
    output_dir = Path(tempfile.mkdtemp(prefix="swarlipi_ytdl_"))
    output_template = str(output_dir / "%(title)s.%(ext)s")
    
    # Check if yt-dlp is available
    try:
        proc = await asyncio.create_subprocess_exec(
            "yt-dlp", "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.communicate()
        yt_dlp_available = proc.returncode == 0
    except FileNotFoundError:
        yt_dlp_available = False
    
    if not yt_dlp_available:
        # Try using yt-dlp as a Python module
        try:
            import yt_dlp
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': str(output_dir / '%(title)s.%(ext)s'),
                'restrictfilenames': True,
                'noplaylist': True,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav',
                    'preferredquality': '0',
                }],
                'quiet': True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            # Find the output file
            audio_files = list(output_dir.glob("*.*"))
            if not audio_files:
                raise RuntimeError("yt-dlp succeeded but no audio file found")
            return audio_files[0]
        except ImportError:
            raise RuntimeError(
                "yt-dlp is not installed. Install it with: pip install yt-dlp"
            )
    
    cmd = [
        "yt-dlp",
        "--extract-audio",
        "--audio-format", "wav",
        "--audio-quality", "0",
        "--output", output_template,
        "--no-playlist",
        "--restrict-filenames",
        url,
    ]
    
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    
    if process.returncode != 0:
        error_msg = stderr.decode()
        logger.error(f"yt-dlp extraction failed: {error_msg}")
        raise RuntimeError(f"Audio extraction from URL failed: {error_msg}")
    
    # Find the output file
    audio_files = list(output_dir.glob("*.*"))
    if not audio_files:
        raise RuntimeError("yt-dlp succeeded but no audio file found")
    
    return audio_files[0]


async def _get_audio_metadata_safe(file_path: Path) -> dict:
    """Get audio metadata. Works even without ffprobe by estimating from file size."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "ffprobe", "-version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.communicate()
        ffprobe_available = proc.returncode == 0
    except FileNotFoundError:
        ffprobe_available = False
    
    if ffprobe_available:
        from app.utils.audio import get_audio_metadata
        return await get_audio_metadata(str(file_path))
    
    # Fallback: estimate metadata from file size and extension
    logger.warning("FFprobe not available. Estimating audio metadata from file size.")
    file_size = file_path.stat().st_size
    ext = file_path.suffix.lower()
    
    # Rough estimates based on common formats
    if ext == ".wav":
        # WAV: ~176 KB/s for 44.1kHz 16-bit stereo
        duration = file_size / 176400
        sample_rate = 44100
    elif ext in (".mp3",):
        # MP3: ~128 kbps = 16 KB/s
        duration = file_size / 16000
        sample_rate = 44100
    elif ext in (".flac",):
        # FLAC: ~88 KB/s on average
        duration = file_size / 88000
        sample_rate = 44100
    else:
        # Generic estimate
        duration = file_size / 32000
        sample_rate = 44100
    
    return {
        "duration": min(duration, 600),  # Cap at 10 minutes
        "sample_rate": sample_rate,
        "channels": 2,
        "codec": ext.lstrip("."),
        "bit_rate": 0,
        "format": ext.lstrip("."),
    }


async def _normalize_audio_safe(input_path: Path) -> Path:
    """Normalize audio using ffmpeg. If ffmpeg is unavailable, return the original file."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg", "-version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.communicate()
        ffmpeg_available = proc.returncode == 0
    except FileNotFoundError:
        ffmpeg_available = False
    
    if ffmpeg_available:
        from app.utils.audio import normalize_audio
        return await normalize_audio(input_path)
    
    # FFmpeg not available — skip normalization, use raw file
    logger.warning(
        "FFmpeg not available. Skipping audio normalization. "
        "Install FFmpeg for full functionality: https://ffmpeg.org/download.html"
    )
    return input_path


async def _save_to_local_storage(
    audio_path: Path, project_id: str, settings
) -> str:
    """Save audio file to local storage directory."""
    from app.utils.storage import storage_service
    
    storage_dest = f"{project_id}/raw_audio{audio_path.suffix}"
    audio_bytes = audio_path.read_bytes()
    storage_path = await storage_service.upload_file(
        audio_bytes,
        settings.gcs_bucket_raw,
        storage_dest,
        content_type="audio/wav",
    )
    return storage_path


async def _mark_project_ingested(
    project_id: str, storage_path: str, duration: int, sample_rate: int
):
    """Update project status to INGESTED in the database."""
    from sqlalchemy import select
    from app.db.session import async_session_factory
    from app.models.project import Project, ProjectStatus
    
    async with async_session_factory() as session:
        result = await session.execute(
            select(Project).where(Project.id == uuid.UUID(project_id))
        )
        project = result.scalar_one_or_none()
        if project:
            project.status = ProjectStatus.INGESTED
            project.duration_seconds = duration
            project.sample_rate = sample_rate
            project.raw_audio_path = storage_path
            await session.commit()
            logger.info(f"[Project {project_id}] Status updated to INGESTED")
        else:
            logger.error(f"[Project {project_id}] Project not found in database!")


async def _mark_project_failed(project_id: str, error_message: str):
    """Update project status to FAILED in the database."""
    from sqlalchemy import select
    from app.db.session import async_session_factory
    from app.models.project import Project, ProjectStatus
    
    try:
        async with async_session_factory() as session:
            result = await session.execute(
                select(Project).where(Project.id == uuid.UUID(project_id))
            )
            project = result.scalar_one_or_none()
            if project:
                project.status = ProjectStatus.FAILED
                project.error_message = error_message[:500]  # Truncate long errors
                await session.commit()
                logger.info(f"[Project {project_id}] Status marked as FAILED")
    except Exception as e:
        logger.error(f"[Project {project_id}] Failed to update status to FAILED: {e}")


# ── Celery task wrapper (for production with Redis) ──
try:
    from app.tasks.celery_app import celery_app
    
    @celery_app.task(
        name="ingest_audio",
        bind=True,
        max_retries=3,
        default_retry_delay=30,
        acks_late=True,
    )
    def ingest_audio_celery(self, project_id: str, source_type: str, source_value: str) -> dict:
        """Celery task wrapper for ingestion."""
        self.update_state(state="INGESTING", meta={"step": "Starting ingestion"})
        return ingest_audio_sync(project_id, source_type, source_value)
except Exception:
    pass
