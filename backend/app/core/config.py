"""
SwarLipi AI — Application Configuration
Centralized settings management using Pydantic Settings.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    app_name: str = "SwarLipi AI"
    app_version: str = "0.1.0"
    debug: bool = True
    secret_key: str = "change-this-in-production"
    allowed_origins: str = "http://localhost:3000,http://localhost:3001"

    # --- Database ---
    database_url: str = "postgresql+asyncpg://swarlipi:swarlipi_pass@localhost:5432/swarlipi_db"
    database_url_sync: str = "postgresql://swarlipi:swarlipi_pass@localhost:5432/swarlipi_db"

    # --- Redis ---
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # --- Google Cloud Storage ---
    gcs_project_id: str = ""
    gcs_bucket_raw: str = "swarlipi-raw-uploads"
    gcs_bucket_stems: str = "swarlipi-separated-stems"
    gcs_bucket_scores: str = "swarlipi-generated-scores"

    # --- AI Models ---
    mt3_model_path: str = "./models/mt3"
    demucs_model: str = "htdemucs_ft"

    # --- Auth ---
    jwt_secret_key: str = "change-this-jwt-secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours

    # --- File Upload ---
    max_upload_size_mb: int = 100
    max_audio_duration_seconds: int = 600  # 10 minutes
    upload_dir: str = "./uploads"

    # --- Gemini ---
    gemini_api_key: str = ""

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def upload_path(self) -> Path:
        """Get upload directory as Path object and ensure it exists."""
        path = Path(self.upload_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def max_upload_bytes(self) -> int:
        """Max upload size in bytes."""
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — singleton pattern."""
    return Settings()
