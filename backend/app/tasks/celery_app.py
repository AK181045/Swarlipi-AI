"""
SwarLipi AI — Celery Application Configuration
Distributed task queue for long-running AI processing jobs.
"""

from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "swarlipi",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        "app.tasks.ingestion_task",
        "app.tasks.separation_task",
        "app.tasks.transcription_task",
    ],
)

# Celery Configuration
celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,

    # Task execution
    task_track_started=True,
    task_time_limit=600,       # 10 minutes hard limit
    task_soft_time_limit=540,  # 9 minutes soft limit
    worker_max_tasks_per_child=50,
    worker_prefetch_multiplier=1,

    # Result backend
    result_expires=3600,  # Results expire after 1 hour

    # Routing
    task_routes={
        "app.tasks.ingestion_task.*": {"queue": "ingestion"},
        "app.tasks.separation_task.*": {"queue": "ai_processing"},
        "app.tasks.transcription_task.*": {"queue": "ai_processing"},
    },

    # Default queue
    task_default_queue="default",

    # For dev, enable eager mode so we don't need a Redis server
    task_always_eager=settings.debug,
)
