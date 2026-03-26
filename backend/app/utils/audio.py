"""
SwarLipi AI — Audio Processing Utilities
FFmpeg-based audio normalization and metadata extraction.
"""

import asyncio
import json
import logging
import shutil
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

# Supported input formats
SUPPORTED_AUDIO_FORMATS = {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac", ".wma"}
SUPPORTED_VIDEO_FORMATS = {".mp4", ".mkv", ".avi", ".webm", ".mov"}
SUPPORTED_FORMATS = SUPPORTED_AUDIO_FORMATS | SUPPORTED_VIDEO_FORMATS

# Target audio specification
TARGET_SAMPLE_RATE = 44100
TARGET_CHANNELS = 2  # Stereo
TARGET_BIT_DEPTH = 16


def validate_file_extension(filename: str) -> bool:
    """Check if the file extension is supported."""
    ext = Path(filename).suffix.lower()
    return ext in SUPPORTED_FORMATS


async def get_audio_metadata(file_path: str | Path) -> dict:
    """Extract audio metadata using FFprobe."""
    file_path = str(file_path)
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        file_path,
    ]

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            logger.error(f"FFprobe failed: {stderr.decode()}")
            return {}

        data = json.loads(stdout.decode())
        format_info = data.get("format", {})
        audio_streams = [
            s for s in data.get("streams", [])
            if s.get("codec_type") == "audio"
        ]

        audio_stream = audio_streams[0] if audio_streams else {}

        return {
            "duration": float(format_info.get("duration", 0)),
            "sample_rate": int(audio_stream.get("sample_rate", 0)),
            "channels": int(audio_stream.get("channels", 0)),
            "codec": audio_stream.get("codec_name", "unknown"),
            "bit_rate": int(format_info.get("bit_rate", 0)),
            "format": format_info.get("format_name", "unknown"),
        }
    except FileNotFoundError:
        logger.error("FFprobe not found. Please install FFmpeg.")
        return {}
    except Exception as e:
        logger.error(f"Error extracting metadata: {e}")
        return {}


async def normalize_audio(
    input_path: str | Path,
    output_path: str | Path | None = None,
    sample_rate: int = TARGET_SAMPLE_RATE,
    channels: int = TARGET_CHANNELS,
) -> Path:
    """Normalize audio to standard WAV format using FFmpeg.

    Converts any supported audio/video to:
    - WAV format
    - 44.1kHz sample rate
    - Stereo (2 channels)
    - 16-bit PCM

    Args:
        input_path: Path to the input audio/video file.
        output_path: Optional output path. If None, creates a temp file.
        sample_rate: Target sample rate (default: 44100).
        channels: Target channel count (default: 2).

    Returns:
        Path to the normalized WAV file.
    """
    input_path = Path(input_path)

    if output_path is None:
        output_dir = Path(tempfile.mkdtemp(prefix="swarlipi_"))
        output_path = output_dir / f"{input_path.stem}_normalized.wav"
    else:
        output_path = Path(output_path)

    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-i", str(input_path),
        "-vn",                    # Remove video stream
        "-acodec", "pcm_s16le",   # 16-bit PCM
        "-ar", str(sample_rate),  # Sample rate
        "-ac", str(channels),     # Channels
        "-y",                     # Overwrite output
        str(output_path),
    ]

    logger.info(f"Normalizing audio: {input_path} → {output_path}")

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        error_msg = stderr.decode()
        logger.error(f"FFmpeg normalization failed: {error_msg}")
        raise RuntimeError(f"Audio normalization failed: {error_msg}")

    logger.info(f"Audio normalized successfully: {output_path}")
    return output_path


async def extract_audio_from_url(url: str, output_dir: str | Path | None = None) -> Path:
    """Extract audio from a YouTube/Vimeo/Web URL using yt-dlp.

    Args:
        url: The video/audio URL.
        output_dir: Directory to save the extracted audio.

    Returns:
        Path to the extracted audio file.
    """
    if output_dir is None:
        output_dir = Path(tempfile.mkdtemp(prefix="swarlipi_ytdl_"))
    else:
        output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    output_template = str(output_dir / "%(title)s.%(ext)s")

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

    logger.info(f"Extracting audio from URL: {url}")

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
    wav_files = list(output_dir.glob("*.wav"))
    if not wav_files:
        raise RuntimeError("yt-dlp succeeded but no WAV file found in output directory")

    output_file = wav_files[0]
    logger.info(f"Audio extracted successfully: {output_file}")
    return output_file


def cleanup_temp_files(*paths: str | Path) -> None:
    """Remove temporary files and directories."""
    for path in paths:
        path = Path(path)
        try:
            if path.is_dir():
                shutil.rmtree(path, ignore_errors=True)
            elif path.is_file():
                path.unlink(missing_ok=True)
        except Exception as e:
            logger.warning(f"Failed to clean up {path}: {e}")
