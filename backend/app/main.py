"""
SwarLipi AI — FastAPI Application Entry Point
The main application that wires everything together.
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("swarlipi")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown events."""
    settings = get_settings()

    # Startup
    logger.info("=" * 60)
    logger.info(f"  🎵 {settings.app_name} v{settings.app_version}")
    logger.info(f"  🔧 Debug mode: {settings.debug}")
    logger.info("=" * 60)

    # Ensure upload directory exists
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

    yield

    # Shutdown
    logger.info("SwarLipi AI shutting down...")


def create_app() -> FastAPI:
    """Application factory — creates and configures the FastAPI app."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=(
            "AI-Powered Music Transcription Platform — "
            "Upload audio or provide URLs to get multi-instrument sheet music "
            "in both Western and Indian Classical (Sargam) notation."
        ),
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS Middleware ──
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── API Routes ──
    from app.api.v1.routes.auth import router as auth_router
    from app.api.v1.routes.transcribe import router as transcribe_router
    from app.api.v1.routes.projects import router as projects_router
    from app.api.v1.routes.scores import router as scores_router
    from app.api.v1.routes.raga import router as raga_router

    api_prefix = "/api/v1"
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(transcribe_router, prefix=api_prefix)
    app.include_router(projects_router, prefix=api_prefix)
    app.include_router(scores_router, prefix=api_prefix)
    app.include_router(raga_router, prefix=api_prefix)

    # ── WebSocket Routes ──
    from app.api.websocket import websocket_score_endpoint, websocket_status_endpoint

    @app.websocket("/ws/status/{project_id}")
    async def ws_status(websocket, project_id: str):
        await websocket_status_endpoint(websocket, project_id)

    @app.websocket("/ws/score/{project_id}")
    async def ws_score(websocket, project_id: str):
        await websocket_score_endpoint(websocket, project_id)

    # ── Health Check ──
    @app.get("/health", tags=["System"])
    async def health_check():
        return {
            "status": "healthy",
            "service": settings.app_name,
            "version": settings.app_version,
        }

    @app.get("/", tags=["System"])
    async def root():
        return {
            "message": f"🎵 Welcome to {settings.app_name}",
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/health",
        }

    # ── Static Files (for local dev file serving) ──
    uploads_dir = Path(settings.upload_dir)
    if uploads_dir.exists():
        app.mount("/files", StaticFiles(directory=str(uploads_dir)), name="files")

    return app


# Create the application instance
app = create_app()
