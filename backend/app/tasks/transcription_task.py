"""
SwarLipi AI — Transcription Task
Celery task for converting audio/stems to MIDI and MusicXML notation.
"""

import json
import logging
import tempfile
from pathlib import Path

from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    name="transcribe_to_notation",
    bind=True,
    max_retries=2,
    default_retry_delay=60,
    acks_late=True,
    time_limit=600,
    soft_time_limit=540,
)
def transcribe_to_notation(
    self,
    project_id: str,
    audio_path: str,
    stem_name: str = "full_mix",
    notation_type: str = "western",
) -> dict:
    """Transcribe audio to MIDI and MusicXML notation.

    Pipeline Step 3: Takes WAV → produces MIDI + MusicXML.

    Args:
        project_id: UUID of the project.
        audio_path: Storage path to the audio/stem file.
        stem_name: Name of the stem (e.g., 'vocals', 'drums', 'full_mix').
        notation_type: 'western', 'sargam', or 'both'.

    Returns:
        Dict with paths to generated MIDI and MusicXML files.
    """
    import asyncio
    from app.utils.storage import storage_service
    from app.core.config import get_settings
    from app.utils.audio import cleanup_temp_files

    settings = get_settings()

    try:
        self.update_state(
            state="TRANSCRIBING",
            meta={"step": f"Transcribing {stem_name}", "stem": stem_name},
        )
        logger.info(f"[Project {project_id}] Transcribing {stem_name}")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        temp_dir = Path(tempfile.mkdtemp(prefix="swarlipi_transcribe_"))

        try:
            # Download audio
            bucket = settings.gcs_bucket_stems if stem_name != "full_mix" else settings.gcs_bucket_raw
            file_key = f"{project_id}/stems/{stem_name}.wav" if stem_name != "full_mix" else f"{project_id}/raw_audio.wav"

            audio_bytes = loop.run_until_complete(
                storage_service.download_file(bucket, file_key)
            )
            input_wav = temp_dir / f"{stem_name}.wav"
            input_wav.write_bytes(audio_bytes)

            # ── Transcription using music21 + basic pitch detection ──
            self.update_state(
                state="TRANSCRIBING",
                meta={"step": f"Running AI transcription on {stem_name}"},
            )

            midi_output = temp_dir / f"{stem_name}.mid"
            xml_output = temp_dir / f"{stem_name}.musicxml"
            metadata = {}

            try:
                # Try using basic-pitch (Spotify) for pitch detection
                from basic_pitch.inference import predict as bp_predict
                from basic_pitch import ICASSP_2022_MODEL_PATH
                import pretty_midi
                import numpy as np

                model_output, midi_data, note_events = bp_predict(str(input_wav))

                # Save MIDI
                midi_data.write(str(midi_output))

                # Convert MIDI to MusicXML using music21
                import music21
                score = music21.converter.parse(str(midi_output))

                # Extract metadata
                tempo_marks = score.flat.getElementsByClass("MetronomeMark")
                if tempo_marks:
                    metadata["tempo"] = int(tempo_marks[0].number)

                time_sigs = score.flat.getElementsByClass("TimeSignature")
                if time_sigs:
                    metadata["time_signature"] = str(time_sigs[0])

                key_sigs = score.flat.getElementsByClass("KeySignature")
                if key_sigs:
                    metadata["key"] = str(key_sigs[0])

                # Export MusicXML
                score.write("musicxml", fp=str(xml_output))

                logger.info(f"[Project {project_id}] Transcription of {stem_name} complete")

            except ImportError as e:
                logger.warning(f"AI model not available ({e}). Generating placeholder notation.")

                # Generate placeholder MusicXML for development
                placeholder_xml = _generate_placeholder_musicxml(stem_name)
                xml_output.write_text(placeholder_xml)

                # Generate placeholder MIDI
                try:
                    import pretty_midi
                    pm = pretty_midi.PrettyMIDI()
                    instrument = pretty_midi.Instrument(program=0)
                    # Simple C major scale as placeholder
                    for i, pitch in enumerate([60, 62, 64, 65, 67, 69, 71, 72]):
                        note = pretty_midi.Note(
                            velocity=80, pitch=pitch,
                            start=i * 0.5, end=(i + 1) * 0.5
                        )
                        instrument.notes.append(note)
                    pm.instruments.append(instrument)
                    pm.write(str(midi_output))
                except ImportError:
                    midi_output.write_bytes(b"")  # Empty placeholder

                metadata = {
                    "tempo": 120,
                    "time_signature": "4/4",
                    "key": "C Major",
                    "placeholder": True,
                }

            # Upload results to storage
            results = {"project_id": project_id, "stem_name": stem_name, "metadata": metadata}

            if midi_output.exists() and midi_output.stat().st_size > 0:
                midi_dest = f"{project_id}/scores/{stem_name}.mid"
                midi_bytes = midi_output.read_bytes()
                midi_path = loop.run_until_complete(
                    storage_service.upload_file(
                        midi_bytes,
                        settings.gcs_bucket_scores,
                        midi_dest,
                        content_type="audio/midi",
                    )
                )
                results["midi_path"] = midi_path

            if xml_output.exists() and xml_output.stat().st_size > 0:
                xml_dest = f"{project_id}/scores/{stem_name}.musicxml"
                xml_bytes = xml_output.read_bytes()
                xml_path = loop.run_until_complete(
                    storage_service.upload_file(
                        xml_bytes,
                        settings.gcs_bucket_scores,
                        xml_dest,
                        content_type="application/xml",
                    )
                )
                results["musicxml_path"] = xml_path

            results["status"] = "transcribed"
            return results

        finally:
            cleanup_temp_files(temp_dir)
            loop.close()

    except Exception as exc:
        logger.error(f"[Project {project_id}] Transcription of {stem_name} failed: {exc}")
        self.update_state(
            state="FAILED",
            meta={"step": f"Transcription of {stem_name} failed", "error": str(exc)},
        )
        raise


def _generate_placeholder_musicxml(part_name: str = "Piano") -> str:
    """Generate a simple placeholder MusicXML for development/testing."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN"
  "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>SwarLipi AI Transcription</work-title>
  </work>
  <identification>
    <creator type="composer">AI Transcription</creator>
    <encoding>
      <software>SwarLipi AI</software>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>{part_name}</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome><beat-unit>quarter</beat-unit><per-minute>120</per-minute></metronome>
        </direction-type>
      </direction>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
  </part>
</score-partwise>'''
