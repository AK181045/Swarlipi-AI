# SwarLipi AI — Master Task List

> **Project**: SwarLipi AI  
> **Document Version**: 1.0.0  
> **Date**: March 26, 2026  
> **Author**: Lead Architect Agent  

---

## Phase Overview

| Phase | Name | Focus | Est. Duration |
|-------|------|-------|---------------|
| **Phase 1** | MVP Foundation | Single-track MP3 → Western Staff Notation | 6–8 weeks |
| **Phase 2** | Multi-Instrument & URL Support | Stem separation + YouTube ingestion | 4–6 weeks |
| **Phase 3** | Indian Classical Notation | Sargam/Shruti/Raga system | 4–6 weeks |
| **Phase 4** | Collaborative & Real-Time Features | Live editing, sharing, polish | 4–6 weeks |

---

## Phase 1 — MVP Foundation
*Goal: User uploads a single MP3 → Gets Western Staff Notation as output*

### 1.1 Project Scaffolding & DevOps Setup
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.1.1 | Initialize Next.js 15+ project with TypeScript strict mode and App Router | 🔴 Critical | — |
| T1.1.2 | Set up Tailwind CSS 4.0, configure "Cosmic Dark" design tokens (colors, typography, spacing) | 🔴 Critical | T1.1.1 |
| T1.1.3 | Initialize FastAPI backend project with Python 3.12+ (project structure, virtual env, pyproject.toml) | 🔴 Critical | — |
| T1.1.4 | Set up PostgreSQL database (Cloud SQL or local Docker) + initial migration setup (Alembic) | 🔴 Critical | T1.1.3 |
| T1.1.5 | Set up Redis instance for Celery task queue and caching | 🔴 Critical | T1.1.3 |
| T1.1.6 | Configure Celery workers with Redis broker | 🔴 Critical | T1.1.5 |
| T1.1.7 | Create Docker Compose file for local development (Frontend, Backend, DB, Redis) | 🟡 High | T1.1.1–T1.1.6 |
| T1.1.8 | Set up Google Cloud Storage (GCS) buckets: `/raw-uploads`, `/separated-stems`, `/generated-scores` | 🟡 High | — |
| T1.1.9 | Configure CI/CD pipeline (GitHub Actions or Cloud Build) | 🟢 Medium | T1.1.7 |
| T1.1.10 | Set up linting (ESLint, Ruff), formatting (Prettier, Black), pre-commit hooks | 🟢 Medium | T1.1.1, T1.1.3 |

### 1.2 Database Schema & Models
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.2.1 | Design and implement `User` model (id, email, subscription_tier, created_at) | 🔴 Critical | T1.1.4 |
| T1.2.2 | Design and implement `Project` model (id, user_id, source_type, source_url, status, created_at) | 🔴 Critical | T1.2.1 |
| T1.2.3 | Design and implement `Stem` model (id, project_id, instrument_type, gcs_path, midi_path, status) | 🔴 Critical | T1.2.2 |
| T1.2.4 | Create Alembic migration scripts for all initial models | 🔴 Critical | T1.2.1–T1.2.3 |
| T1.2.5 | Implement database CRUD utility layer (SQLAlchemy async sessions) | 🟡 High | T1.2.4 |

### 1.3 Authentication
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.3.1 | Integrate Clerk or NextAuth.js for frontend authentication (Google/GitHub SSO) | 🟡 High | T1.1.1 |
| T1.3.2 | Implement backend JWT token verification middleware (FastAPI) | 🟡 High | T1.1.3 |
| T1.3.3 | Create protected route wrappers / auth guards (frontend + backend) | 🟡 High | T1.3.1, T1.3.2 |

### 1.4 Audio Ingestion (File Upload Only — Phase 1)
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.4.1 | Build file upload API endpoint: `POST /api/v1/transcribe` (accept .mp3, .wav, .flac) | 🔴 Critical | T1.1.3 |
| T1.4.2 | Implement file validation (format, size limits, duration limits) | 🔴 Critical | T1.4.1 |
| T1.4.3 | Integrate FFmpeg for audio normalization (convert to 44.1kHz WAV) | 🔴 Critical | T1.4.1 |
| T1.4.4 | Upload normalized audio to GCS `/raw-uploads` bucket | 🟡 High | T1.1.8, T1.4.3 |
| T1.4.5 | Create Project record in DB with status `PENDING` on upload | 🟡 High | T1.2.2, T1.4.1 |

### 1.5 AI Transcription Pipeline (Single Track — Phase 1)
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.5.1 | Set up Google MT3 model (containerize or load locally for dev) | 🔴 Critical | — |
| T1.5.2 | Build Celery task: `transcribe_audio` — takes WAV → outputs MIDI | 🔴 Critical | T1.1.6, T1.5.1 |
| T1.5.3 | Implement MIDI-to-MusicXML conversion pipeline (using `music21` or `pretty_midi`) | 🔴 Critical | T1.5.2 |
| T1.5.4 | Store generated MIDI + MusicXML to GCS `/generated-scores` | 🟡 High | T1.5.3, T1.1.8 |
| T1.5.5 | Update Project status progression: `PENDING → PROCESSING → COMPLETED / FAILED` | 🟡 High | T1.5.2, T1.2.5 |
| T1.5.6 | Implement error handling, retries, and timeout logic for AI tasks | 🟡 High | T1.5.2 |

### 1.6 Score Retrieval API
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.6.1 | Build `GET /api/v1/score/{id}` — returns MusicXML/JSON for the UI renderer | 🔴 Critical | T1.5.4 |
| T1.6.2 | Build `GET /api/v1/projects` — list user's projects with status | 🟡 High | T1.2.5 |
| T1.6.3 | Implement WebSocket or SSE for real-time processing status updates | 🟡 High | T1.5.5 |

### 1.7 Frontend — Core UI
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.7.1 | Design and build the **Landing Page / Dashboard** ("Start New Project" CTA) | 🔴 Critical | T1.1.2 |
| T1.7.2 | Build **Upload Component** (drag-and-drop, file picker, progress bar) | 🔴 Critical | T1.7.1 |
| T1.7.3 | Build **Processing Status Page** (real-time progress with animated indicators) | 🔴 Critical | T1.6.3 |
| T1.7.4 | Integrate **Verovio** for rendering MusicXML as Western Staff Notation | 🔴 Critical | T1.6.1 |
| T1.7.5 | Build **Score Viewer Page** — horizontal scrolling "filmstrip" sheet music | 🔴 Critical | T1.7.4 |
| T1.7.6 | Implement TanStack Query for async data fetching + caching | 🟡 High | T1.7.1 |
| T1.7.7 | Build **Project History / My Projects** page | 🟢 Medium | T1.6.2 |

### 1.8 Export MVP
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.8.1 | Implement PDF export using LilyPond (MusicXML → LilyPond → PDF) | 🟡 High | T1.5.3 |
| T1.8.2 | Implement MIDI file download endpoint | 🟡 High | T1.5.4 |
| T1.8.3 | Implement MusicXML download endpoint | 🟡 High | T1.5.4 |
| T1.8.4 | Build **Export Panel UI** component on Score Viewer page | 🟡 High | T1.7.5 |

### 1.9 Testing & Phase 1 QA
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T1.9.1 | Unit tests for backend API endpoints (pytest) | 🟡 High | T1.4–T1.6 |
| T1.9.2 | Unit tests for transcription pipeline logic | 🟡 High | T1.5 |
| T1.9.3 | Integration tests: Full upload → transcribe → view flow | 🟡 High | All Phase 1 |
| T1.9.4 | Frontend component tests (Vitest / React Testing Library) | 🟢 Medium | T1.7 |
| T1.9.5 | Accuracy benchmark: Evaluate >90% note accuracy for Western classical test set | 🟡 High | T1.5 |

---

## Phase 2 — Multi-Instrument Separation & URL Support
*Goal: YouTube/URL ingestion + multi-stem separation into 6 instrument tracks*

### 2.1 YouTube / URL Ingestion
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T2.1.1 | Integrate `yt-dlp` into Ingestion Engine for YouTube/Vimeo URL audio extraction | 🔴 Critical | Phase 1 done |
| T2.1.2 | Build URL validation and sanitization layer | 🔴 Critical | T2.1.1 |
| T2.1.3 | Update `POST /api/v1/transcribe` to accept URL input type | 🔴 Critical | T2.1.1 |
| T2.1.4 | Handle yt-dlp edge cases (age-restricted, private videos, geo-blocks) | 🟡 High | T2.1.1 |
| T2.1.5 | Build **URL Input Component** on the frontend (paste URL, auto-detect platform) | 🔴 Critical | T2.1.3 |

### 2.2 Source Separation (Demucs v5)
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T2.2.1 | Set up Meta Demucs v5 model (containerized, GPU-enabled) | 🔴 Critical | — |
| T2.2.2 | Deploy Demucs to Vertex AI endpoint or local GPU worker | 🔴 Critical | T2.2.1 |
| T2.2.3 | Build Celery task: `separate_stems` — takes WAV → outputs 6 stems (Vocals, Drums, Bass, Piano, Guitar, Other) | 🔴 Critical | T2.2.2, T1.1.6 |
| T2.2.4 | Store separated stems to GCS `/separated-stems` bucket | 🟡 High | T2.2.3 |
| T2.2.5 | Update Stem DB model to store all 6 instrument results | 🟡 High | T2.2.3 |
| T2.2.6 | Update pipeline: Ingestion → Separation → Per-Stem Transcription → Score | 🔴 Critical | T2.2.3, T1.5.2 |

### 2.3 Multi-Track Transcription
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T2.3.1 | Modify transcription pipeline to process each stem independently | 🔴 Critical | T2.2.6 |
| T2.3.2 | Merge per-stem MusicXML into a single multi-track score | 🔴 Critical | T2.3.1 |
| T2.3.3 | Extract and embed tempo, time signature, and key metadata | 🟡 High | T2.3.1 |

### 2.4 Frontend — Multi-Track Studio View
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T2.4.1 | Build **Multi-Track Studio View** — synchronized scores for all instruments | 🔴 Critical | T2.3.2 |
| T2.4.2 | Implement **Instrument Mixer** panel (Solo/Mute per track) | 🔴 Critical | T2.4.1 |
| T2.4.3 | Integrate **Wavesurfer.js** for per-stem waveform visualization | 🟡 High | T2.4.1 |
| T2.4.4 | Integrate **Tone.js** for MIDI playback with synthesizer sounds | 🟡 High | T2.4.1 |
| T2.4.5 | Sync Wavesurfer playhead with Verovio notation scroll cursor | 🔴 Critical | T2.4.3, T2.4.4 |
| T2.4.6 | Update processing status UI to show per-stem progress | 🟢 Medium | T2.2.3 |

### 2.5 Phase 2 Testing
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T2.5.1 | Test URL ingestion with 50+ diverse YouTube links | 🟡 High | T2.1 |
| T2.5.2 | Evaluate stem separation quality against benchmark tracks | 🟡 High | T2.2 |
| T2.5.3 | Integration test: URL → Stems → Multi-Track Score → View | 🟡 High | All Phase 2 |
| T2.5.4 | Performance test: Ensure <2 min processing for 4-min songs | 🟡 High | All Phase 2 |

---

## Phase 3 — Indian Classical Notation (Sargam)
*Goal: Full Sargam/Shruti/Raga support including Tabla Bol transcription*

### 3.1 Indian Classical AI Engine
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T3.1.1 | Integrate CREPE for microtonal pitch-contour tracking (22 Shrutis) | 🔴 Critical | Phase 2 done |
| T3.1.2 | Build Meend (slide) detection algorithm on Vocal + "Other" stems | 🔴 Critical | T3.1.1 |
| T3.1.3 | Build Gamaka (ornamentation) detection logic | 🔴 Critical | T3.1.1 |
| T3.1.4 | Integrate Essentia Python for raga analysis and note classification | 🟡 High | T3.1.1 |
| T3.1.5 | Build specialized Tabla Bol transcriber (Dha, Dhin, Na, Ti, etc.) for Drum stems | 🔴 Critical | T2.2.3 |

### 3.2 Raga Dictionary & Notation Mapping
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T3.2.1 | Build Raga Dictionary database (200+ Ragas with scale mappings, Thaat/Melakarta) | 🔴 Critical | T1.1.4 |
| T3.2.2 | Build Frequency → Sargam (Sa Re Ga Ma Pa Dha Ni) mapping engine | 🔴 Critical | T3.1.1 |
| T3.2.3 | Implement `GET /api/v1/raga-lookup` API endpoint | 🟡 High | T3.2.1 |
| T3.2.4 | Implement toggle logic: Western "C Major" ↔ Indian "Bilawal Thaat" reference | 🟡 High | T3.2.2 |
| T3.2.5 | Design custom JSON schema for Sargam text output | 🟡 High | T3.2.2 |
| T3.2.6 | Integrate pgvector / Pinecone for Raga pattern indexing and similarity search | 🟢 Medium | T3.2.1 |

### 3.3 Gemini LLM Integration
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T3.3.1 | Integrate Gemini 2.0 Flash for automated Raga identification from pitch data | 🟡 High | T3.1.4 |
| T3.3.2 | Use Gemini for lyric alignment with Vocal stem timestamps | 🟢 Medium | T3.1.1 |
| T3.3.3 | Use Gemini for metadata tagging (genre, mood, instrument identification) | 🟢 Medium | T3.3.1 |

### 3.4 Frontend — Indian Classical UI
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T3.4.1 | Build **Toggle Switch** UI: Instant switch between [Western Staff] ↔ [Sargam Text] | 🔴 Critical | T3.2.2 |
| T3.4.2 | Build **Sargam Text Renderer** component (Sa Re Ga with slide/ornament indicators) | 🔴 Critical | T3.2.5 |
| T3.4.3 | Build **Tabla Bol Display** component (Dha Dhin Na rhythmic text) | 🔴 Critical | T3.1.5 |
| T3.4.4 | Build **Raga Info Panel** (show detected raga, thaat, aroha/avaroha) | 🟡 High | T3.3.1 |
| T3.4.5 | Add Devanagari script option for Sargam display | 🟢 Medium | T3.4.2 |

### 3.5 Export — Indian Classical Formats
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T3.5.1 | Export Sargam notation as styled PDF (with proper Indian music formatting) | 🟡 High | T3.4.2 |
| T3.5.2 | Export Sargam as JSON (custom schema) | 🟡 High | T3.2.5 |
| T3.5.3 | Add Guitar Pro (.gp) export format | 🟢 Medium | T1.8 |

### 3.6 Phase 3 Testing
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T3.6.1 | Accuracy benchmark: >85% note/slide accuracy for Indian Classical test set | 🔴 Critical | T3.1 |
| T3.6.2 | Validate Raga detection against musicologist-annotated dataset | 🟡 High | T3.3.1 |
| T3.6.3 | Test Tabla Bol accuracy against labeled percussion samples | 🟡 High | T3.1.5 |
| T3.6.4 | User acceptance testing with Indian Classical musicians | 🟡 High | All Phase 3 |

---

## Phase 4 — Real-Time Collaboration & Production Polish
*Goal: Collaborative editing, production-grade UX, and scaling*

### 4.1 Interactive Score Editor
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T4.1.1 | Build **Note Editor** — click-to-edit individual notes in the score | 🔴 Critical | Phase 3 done |
| T4.1.2 | Implement `PATCH /api/v1/score/{id}` — save user corrections to DB | 🔴 Critical | T4.1.1 |
| T4.1.3 | Add undo/redo history for editor actions | 🟡 High | T4.1.1 |
| T4.1.4 | Build toolbar: Add/delete notes, change duration, add dynamics markings | 🟡 High | T4.1.1 |
| T4.1.5 | Implement playback cursor that syncs with edited notation | 🟡 High | T4.1.1, T2.4.4 |

### 4.2 Real-Time Collaboration
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T4.2.1 | Implement WebSocket server for real-time score synchronization | 🔴 Critical | T4.1.2 |
| T4.2.2 | Build Conflict Resolution logic (Operational Transformation or CRDT) | 🔴 Critical | T4.2.1 |
| T4.2.3 | Multi-user cursor display (see where collaborators are editing) | 🟡 High | T4.2.1 |
| T4.2.4 | Implement project sharing (invite by email/link) | 🟡 High | T4.2.1 |
| T4.2.5 | Role-based permissions (Owner, Editor, Viewer) | 🟡 High | T4.2.4 |

### 4.3 Infrastructure Scaling
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T4.3.1 | Deploy to Google Kubernetes Engine (GKE) — Kubernetes manifests for all services | 🔴 Critical | All Phases |
| T4.3.2 | Set up Vertex AI endpoints for Demucs v5 and MT3 model serving | 🔴 Critical | T2.2.1, T1.5.1 |
| T4.3.3 | Implement horizontal auto-scaling for AI worker pods | 🟡 High | T4.3.1 |
| T4.3.4 | Set up monitoring (Prometheus + Grafana or Google Cloud Monitoring) | 🟡 High | T4.3.1 |
| T4.3.5 | Set up centralized logging (Google Cloud Logging / ELK) | 🟢 Medium | T4.3.1 |

### 4.4 User Experience Polish
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T4.4.1 | Implement onboarding tutorial / guided walkthrough for new users | 🟡 High | All UI |
| T4.4.2 | Add keyboard shortcuts for editor (playback, navigation, editing) | 🟢 Medium | T4.1.1 |
| T4.4.3 | Dark/Light theme toggle (extend Cosmic Dark theme) | 🟢 Medium | T1.1.2 |
| T4.4.4 | Mobile responsive design for Score Viewer (read-only mode) | 🟡 High | T1.7.5 |
| T4.4.5 | Accessibility audit (WCAG 2.1 AA compliance) | 🟢 Medium | All UI |
| T4.4.6 | SEO optimization for public-facing pages | 🟢 Medium | T1.7.1 |

### 4.5 Subscription & Billing
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T4.5.1 | Integrate Stripe for subscription billing | 🟡 High | T1.3 |
| T4.5.2 | Implement subscription tiers (Free, Pro, Enterprise) with usage limits | 🟡 High | T4.5.1 |
| T4.5.3 | Build billing dashboard / usage tracking UI | 🟢 Medium | T4.5.2 |

### 4.6 Phase 4 Testing & Launch
| ID | Task | Priority | Dependencies |
|----|------|----------|-------------|
| T4.6.1 | End-to-end test: Full flow across all phases | 🔴 Critical | All Phases |
| T4.6.2 | Load testing (simulating 100+ concurrent users) | 🟡 High | T4.3 |
| T4.6.3 | Security audit (OWASP Top 10, dependency scanning) | 🟡 High | All |
| T4.6.4 | Beta launch with closed group of musicians | 🟡 High | All |
| T4.6.5 | Public launch | 🔴 Critical | T4.6.1–T4.6.4 |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Tasks | **~100** |
| Phase 1 Tasks | ~35 |
| Phase 2 Tasks | ~20 |
| Phase 3 Tasks | ~22 |
| Phase 4 Tasks | ~23 |
| 🔴 Critical Tasks | ~40 |
| 🟡 High Priority | ~40 |
| 🟢 Medium Priority | ~20 |
