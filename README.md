# 🎵 SwarLipi AI

> **AI-Powered Music Transcription Platform**  
> Transform any audio into multi-instrument sheet music in Western Staff and Indian Sargam notation.

## Architecture

```
swarlipi-ai/
├── frontend/          # Next.js 15 + TypeScript + Tailwind CSS 4.0
├── backend/           # FastAPI + Python 3.12 + Celery + Redis
├── docs/              # Project documentation
├── docker-compose.yml # Full development stack
└── .gitignore
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 4.0, Verovio, Wavesurfer.js, Tone.js |
| **Backend** | FastAPI, Python 3.12, Celery, Redis |
| **AI/ML** | Demucs v5 (stems), Google MT3 (transcription), CREPE (pitch), Gemini 2.0 Flash |
| **Database** | PostgreSQL, Redis |
| **Storage** | Google Cloud Storage |
| **Infrastructure** | Docker, Kubernetes (GKE), Vertex AI |

## Getting Started

### Prerequisites
- Node.js 22+
- Python 3.12+
- Docker & Docker Compose
- FFmpeg

### Quick Start (Docker)

```bash
docker-compose up -d
```

This starts:
- **Frontend** at `http://localhost:3000`
- **Backend API** at `http://localhost:8000`
- **API Docs** at `http://localhost:8000/docs`
- **PostgreSQL** at `localhost:5432`
- **Redis** at `localhost:6379`

### Manual Setup

#### Backend
```bash
cd backend
python -m venv .venv
.venv/Scripts/activate  # Windows
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/transcribe` | Submit file or URL for transcription |
| `GET` | `/api/v1/projects` | List user's projects |
| `GET` | `/api/v1/score/{id}` | Get rendered score data |
| `GET` | `/api/v1/score/{id}/export` | Export as PDF/MIDI/MusicXML |
| `GET` | `/api/v1/raga-lookup` | Search raga dictionary |
| `WS` | `/ws/status/{id}` | Real-time processing status |

## Project Phases

- ✅ **Phase 1**: MVP — Single MP3 → Western Staff Notation
- ✅ **Phase 2**: Multi-Instrument Separation (Demucs v5) + YouTube URL Support
- ✅ **Phase 3**: Indian Classical (Sargam/Shruti/Raga/Tabla Bol)
- ✅ **Phase 4**: Interactive Editor + Real-Time Collaboration

## License

MIT © 2026 SwarLipi AI
