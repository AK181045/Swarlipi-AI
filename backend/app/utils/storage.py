"""
SwarLipi AI — Google Cloud Storage Utilities
Handles file upload/download/URL generation for GCS buckets.
"""

import uuid
from pathlib import Path

from app.core.config import get_settings


class StorageService:
    """Abstraction layer for file storage.

    In development mode, uses local filesystem.
    In production, uses Google Cloud Storage.
    """

    def __init__(self):
        self.settings = get_settings()
        self._use_local = not bool(self.settings.gcs_project_id)
        self._local_base = Path(self.settings.upload_dir)
        self._gcs_client = None

    def _get_gcs_client(self):
        """Lazy-initialize GCS client."""
        if self._gcs_client is None:
            try:
                from google.cloud import storage
                self._gcs_client = storage.Client(project=self.settings.gcs_project_id)
            except Exception:
                self._use_local = True
        return self._gcs_client

    async def upload_file(
        self,
        file_data: bytes,
        bucket_name: str,
        destination_path: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """Upload a file and return the storage path/URL."""
        if self._use_local:
            return await self._upload_local(file_data, bucket_name, destination_path)
        return await self._upload_gcs(file_data, bucket_name, destination_path, content_type)

    async def _upload_local(
        self,
        file_data: bytes,
        bucket_name: str,
        destination_path: str,
    ) -> str:
        """Store file locally (dev mode)."""
        local_dir = self._local_base / bucket_name
        local_dir.mkdir(parents=True, exist_ok=True)

        file_path = local_dir / destination_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(file_data)

        return str(file_path)

    async def _upload_gcs(
        self,
        file_data: bytes,
        bucket_name: str,
        destination_path: str,
        content_type: str,
    ) -> str:
        """Upload to Google Cloud Storage."""
        client = self._get_gcs_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(destination_path)
        blob.upload_from_string(file_data, content_type=content_type)
        return f"gs://{bucket_name}/{destination_path}"

    async def download_file(self, bucket_name: str, source_path: str) -> bytes:
        """Download a file from storage. Self-healing in dev mode."""
        if self._use_local:
            file_path = self._local_base / bucket_name / source_path
            try:
                if not file_path.exists():
                    raise FileNotFoundError(f"Local file missing: {file_path}")
                return file_path.read_bytes()
            except Exception as e:
                if self.settings.debug:
                    # SELF-HEALING: If in debug and file is missing, use the global mock
                    mock_path = self._local_base / bucket_name / "mock_audio.wav"
                    if mock_path.exists():
                        import logging
                        logging.getLogger(__name__).warning(f"File {source_path} missing. Self-healing with {mock_path}")
                        return mock_path.read_bytes()
                raise e

        # Production GCS logic
        client = self._get_gcs_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(source_path)
        return blob.download_as_bytes()

    async def get_signed_url(
        self,
        bucket_name: str,
        file_path: str,
        expiration_minutes: int = 60,
    ) -> str:
        """Generate a signed URL for temporary file access."""
        if self._use_local:
            # In dev mode, return a local file URL
            local_path = self._local_base / bucket_name / file_path
            return f"/files/{bucket_name}/{file_path}"

        from datetime import timedelta
        client = self._get_gcs_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(file_path)

        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expiration_minutes),
            method="GET",
        )
        return url

    async def delete_file(self, bucket_name: str, file_path: str) -> bool:
        """Delete a file from storage."""
        try:
            if self._use_local:
                local_path = self._local_base / bucket_name / file_path
                local_path.unlink(missing_ok=True)
            else:
                client = self._get_gcs_client()
                bucket = client.bucket(bucket_name)
                blob = bucket.blob(file_path)
                blob.delete()
            return True
        except Exception:
            return False

    @staticmethod
    def generate_path(project_id: str, filename: str, prefix: str = "") -> str:
        """Generate a unique storage path for a file."""
        unique_id = uuid.uuid4().hex[:8]
        safe_name = Path(filename).stem
        extension = Path(filename).suffix
        if prefix:
            return f"{prefix}/{project_id}/{safe_name}_{unique_id}{extension}"
        return f"{project_id}/{safe_name}_{unique_id}{extension}"


# Singleton instance
storage_service = StorageService()
