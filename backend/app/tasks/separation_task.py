"""
SwarLipi AI — Source Separation Task
Celery task for separating audio into instrument stems using Demucs v5.
"""

import logging
import tempfile
from pathlib import Path

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    name="separate_stems",
    bind=True,
    max_retries=2,
    default_retry_delay=60,
    acks_late=True,
    time_limit=900,      # 15 minutes for GPU processing
    soft_time_limit=840,
)
def separate_stems(self, project_id: str, audio_storage_path: str) -> dict:
    """Separate audio into instrument stems using Demucs v5.

    Pipeline Step 2: Takes normalized WAV → produces 6 stems.

    Stems: vocals, drums, bass, piano, guitar, other
    (Phase 2 task - initial scaffolding)

    Args:
        project_id: UUID of the project.
        audio_storage_path: Path to normalized WAV in storage.

    Returns:
        Dict with paths to separated stem files.
    """
    import asyncio
    from app.utils.storage import storage_service
    from app.core.config import get_settings
    from app.utils.audio import cleanup_temp_files

    settings = get_settings()

    try:
        self.update_state(state="SEPARATING", meta={"step": "Downloading audio"})
        logger.info(f"[Project {project_id}] Starting stem separation")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        temp_dir = Path(tempfile.mkdtemp(prefix="swarlipi_demucs_"))

        try:
            # Download the normalized audio
            audio_bytes = loop.run_until_complete(
                storage_service.download_file(
                    settings.gcs_bucket_raw,
                    f"{project_id}/raw_audio.wav",
                )
            )
            input_wav = temp_dir / "input.wav"
            input_wav.write_bytes(audio_bytes)

            # Run Demucs separation
            self.update_state(
                state="SEPARATING",
                meta={"step": "Running Demucs v5 stem separation (GPU)"},
            )

            output_dir = temp_dir / "separated"
            output_dir.mkdir(exist_ok=True)

            # --- Demucs v5 Inference ---
            try:
                import demucs.separate
                import subprocess
                import sys

                # Use subprocess to run demucs CLI for better GPU management
                cmd = [
                    sys.executable, "-m", "demucs",
                    "--two-stems=vocals" if False else "-n", settings.demucs_model,
                    "--out", str(output_dir),
                    str(input_wav),
                ]

                process = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=600,
                )

                if process.returncode != 0:
                    logger.error(f"Demucs failed: {process.stderr}")
                    raise RuntimeError(f"Demucs separation failed: {process.stderr}")

            except ImportError:
                logger.warning("Demucs not installed. Creating placeholder stems for testing.")
                # Placeholder: Copy input as all stems (for development)
                stem_names = ["vocals", "drums", "bass", "other"]
                model_output_dir = output_dir / settings.demucs_model / "input"
                model_output_dir.mkdir(parents=True, exist_ok=True)
                for stem_name in stem_names:
                    stem_file = model_output_dir / f"{stem_name}.wav"
                    stem_file.write_bytes(audio_bytes)

            # Find and upload separated stems
            stem_results = {}
            model_output = output_dir / settings.demucs_model / "input"

            if not model_output.exists():
                # Try finding output in alternate paths
                for d in output_dir.rglob("*.wav"):
                    model_output = d.parent
                    break

            stem_types = ["vocals", "drums", "bass", "piano", "guitar", "other"]

            for stem_name in stem_types:
                stem_file = model_output / f"{stem_name}.wav"
                if stem_file.exists():
                    self.update_state(
                        state="SEPARATING",
                        meta={"step": f"Uploading {stem_name} stem"},
                    )

                    storage_dest = f"{project_id}/stems/{stem_name}.wav"
                    stem_bytes = stem_file.read_bytes()
                    stem_path = loop.run_until_complete(
                        storage_service.upload_file(
                            stem_bytes,
                            settings.gcs_bucket_stems,
                            storage_dest,
                            content_type="audio/wav",
                        )
                    )
                    stem_results[stem_name] = stem_path
                    logger.info(f"[Project {project_id}] {stem_name} stem uploaded: {stem_path}")

            logger.info(
                f"[Project {project_id}] Separation complete: {len(stem_results)} stems"
            )

            return {
                "project_id": project_id,
                "stems": stem_results,
                "stem_count": len(stem_results),
                "status": "separated",
            }

        finally:
            cleanup_temp_files(temp_dir)
            loop.close()

    except Exception as exc:
        logger.error(f"[Project {project_id}] Separation failed: {exc}")
        self.update_state(
            state="FAILED",
            meta={"step": "Separation failed", "error": str(exc)},
        )
        raise
