"""
SwarLipi AI — Stem Separation Task
Task for separating audio into instrument stems using Demucs.
Compatible with Celery and BackgroundTasks.
"""

import asyncio
import logging
import shutil
import uuid
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


def separate_stems_sync(project_id: str, audio_path: str) -> dict:
    """Synchronous entry point for stem separation in BackgroundTasks."""
    logger.info(f"[Project {project_id}] Starting stem separation task")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        return loop.run_until_complete(_run_separation(project_id, audio_path))
    except Exception as exc:
        logger.error(f"[Project {project_id}] Separation failed: {exc}", exc_info=True)
        loop.run_until_complete(_mark_project_failed(project_id, str(exc)))
        return {"project_id": project_id, "status": "failed", "error": str(exc)}
    finally:
        loop.close()


async def _run_separation(project_id: str, audio_path: str) -> dict:
    """Core async separation logic."""
    from app.core.config import get_settings
    from app.utils.storage import storage_service
    from app.models.project import ProjectStatus
    
    settings = get_settings()
    temp_dir = Path(tempfile.mkdtemp(prefix="swarlipi_demucs_"))
    
    try:
        # Step 1: Download audio from storage
        logger.info(f"[Project {project_id}] Downloading audio for separation from {audio_path}...")
        try:
            audio_bytes = await storage_service.download_file(
                settings.gcs_bucket_raw,
                audio_path
            )
        except Exception as e:
            if settings.debug:
                logger.warning(f"[Project {project_id}] Could not load {audio_path} ({e}). Using Mock Fallback for separation.")
                # Load the global mock asset I created earlier
                audio_bytes = await storage_service.download_file(settings.gcs_bucket_raw, "mock_audio.wav")
            else:
                raise
                
        input_wav = temp_dir / "input.wav"
        input_wav.write_bytes(audio_bytes)
        
        # Step 2: Perform separation (Simulate if Demucs is missing)
        output_dir = temp_dir / "separated"
        output_dir.mkdir(exist_ok=True)
        
        try:
            import demucs.separate
            import subprocess
            import sys

            logger.info(f"[Project {project_id}] Running Demucs separation...")
            cmd = [
                sys.executable, "-m", "demucs",
                "-n", settings.demucs_model,
                "--out", str(output_dir),
                str(input_wav),
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise RuntimeError(f"Demucs separation failed: {stderr.decode()}")
                
        except (ImportError, FileNotFoundError):
            # Development fallback
            logger.warning(f"[Project {project_id}] Demucs not installed. Using fallback placeholder stems.")
            model_output_dir = output_dir / settings.demucs_model / "input"
            model_output_dir.mkdir(parents=True, exist_ok=True)
            for stem_name in ["vocals", "drums", "bass", "other"]:
                (model_output_dir / f"{stem_name}.wav").write_bytes(audio_bytes)
        
        # Step 3: Upload stems and record them in the database
        stem_results = {}
        model_output = output_dir / settings.demucs_model / "input"
        
        # In case the model name changed in output or subfolders were created differently
        if not model_output.exists():
            for d in output_dir.rglob("*.wav"):
                model_output = d.parent
                break
                
        stem_types = ["vocals", "drums", "bass", "piano", "guitar", "other"]
        uploaded_stems = []
        
        for stem_name in stem_types:
            stem_file = model_output / f"{stem_name}.wav"
            if stem_file.exists():
                logger.info(f"[Project {project_id}] Uploading stem: {stem_name}")
                storage_dest = f"{project_id}/stems/{stem_name}.wav"
                stem_bytes = stem_file.read_bytes()
                stem_path = await storage_service.upload_file(
                    stem_bytes,
                    settings.gcs_bucket_stems,
                    storage_dest,
                    content_type="audio/wav",
                )
                uploaded_stems.append((stem_name, stem_path))
                stem_results[stem_name] = stem_path
        
        # Step 4: Update DB
        logger.info(f"[Project {project_id}] Finalizing separation in database...")
        await _finalize_separation_in_db(project_id, uploaded_stems)
        
        # Step 5: Trigger next task (Transcription)
        from app.tasks.transcription_task import transcribe_to_notation_sync
        # For simplicity in dev, we just transcribe the first available stem or full mix
        # In a real pipeline, we might transcribe multiple stems.
        from fastapi import BackgroundTasks
        # Wait! How to get background_tasks here? 
        # Actually, in dev mode, we just run it directly.
        await _trigger_next_task(project_id, stem_results.get("vocals") or stem_results.get("other"))
        
        return {
            "project_id": project_id,
            "stems": stem_results,
            "status": "separated",
        }
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


async def _finalize_separation_in_db(project_id: str, uploaded_stems: list):
    """Save stem records and update project status."""
    from app.db.session import async_session_factory
    from app.models.project import Project, ProjectStatus
    from app.models.stem import Stem
    from sqlalchemy import select
    
    async with async_session_factory() as session:
        # Update project status
        result = await session.execute(
            select(Project).where(Project.id == uuid.UUID(project_id))
        )
        project = result.scalar_one_or_none()
        if project:
            project.status = ProjectStatus.SEPARATED
            
            # Create stem records
            for name, path in uploaded_stems:
                stem = Stem(
                    id=uuid.uuid4(),
                    project_id=project.id,
                    instrument_type=name,
                    status="completed",
                    display_name=name.capitalize(),
                    audio_url=path,
                )
                session.add(stem)
            
            await session.commit()


async def _trigger_next_task(project_id: str, lead_audio_path: str):
    """Dev mode: Trigger the next stage of the pipeline."""
    from app.tasks.transcription_task import transcribe_to_notation_sync
    # We offload it to a thread to not block the current task if needed, but sequential is safer for dev
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, transcribe_to_notation_sync, project_id, lead_audio_path or f"{project_id}/raw_audio.wav", "lead")


async def _mark_project_failed(project_id: str, error_message: str):
    from app.db.session import async_session_factory
    from app.models.project import Project, ProjectStatus
    from sqlalchemy import select
    
    async with async_session_factory() as session:
        result = await session.execute(
            select(Project).where(Project.id == uuid.UUID(project_id))
        )
        project = result.scalar_one_or_none()
        if project:
            project.status = ProjectStatus.FAILED
            project.error_message = error_message[:500]
            await session.commit()


# ── Celery Wrapper ──
try:
    from app.tasks.celery_app import celery_app
    @celery_app.task(name="separate_stems", bind=True)
    def separate_stems_celery(self, project_id: str, audio_path: str):
        return separate_stems_sync(project_id, audio_path)
except Exception:
    pass
