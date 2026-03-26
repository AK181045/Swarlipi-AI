"""
SwarLipi AI — Raga Lookup API Route (Phase 3)
GET /api/v1/raga-lookup — Search the Raga dictionary.
"""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, Query

from app.schemas.raga import RagaDetail, RagaListResponse

router = APIRouter(prefix="/raga-lookup", tags=["Raga Dictionary"])

logger = logging.getLogger(__name__)

# Load raga dictionary at module level
_raga_data: list[dict] = []
_raga_dict_path = Path(__file__).resolve().parents[4] / "data" / "raga_dictionary.json"


def _load_ragas() -> list[dict]:
    """Load raga dictionary from JSON file."""
    global _raga_data
    if not _raga_data:
        try:
            if _raga_dict_path.exists():
                with open(_raga_dict_path) as f:
                    _raga_data = json.load(f)
                logger.info(f"Loaded {len(_raga_data)} ragas from dictionary")
            else:
                logger.warning(f"Raga dictionary not found at {_raga_dict_path}")
                _raga_data = _get_default_ragas()
        except Exception as e:
            logger.error(f"Error loading raga dictionary: {e}")
            _raga_data = _get_default_ragas()
    return _raga_data


def _get_default_ragas() -> list[dict]:
    """Return a default set of common ragas for initial testing."""
    return [
        {
            "id": 1, "name": "Bilawal", "aliases": ["Bilaval", "Shankarabharanam"],
            "thaat": "Bilawal", "melakarta": 29,
            "aroha": "Sa Re Ga Ma Pa Dha Ni Sa'",
            "avaroha": "Sa' Ni Dha Pa Ma Ga Re Sa",
            "pakad": "Ga Re Sa, Pa Ga Ma Re Sa",
            "vadi": "Dha", "samvadi": "Ga",
            "time_of_day": "Late Morning", "mood": "Serene, Devotional",
            "scale_western": ["C", "D", "E", "F", "G", "A", "B"],
            "scale_sargam": ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"],
        },
        {
            "id": 2, "name": "Yaman", "aliases": ["Kalyan", "Kalyani"],
            "thaat": "Kalyan", "melakarta": 65,
            "aroha": "Sa Re Ga Ma(T) Pa Dha Ni Sa'",
            "avaroha": "Sa' Ni Dha Pa Ma(T) Ga Re Sa",
            "pakad": "Ni Re Ga, Re Sa, Ma(T) Ga Re Sa",
            "vadi": "Ga", "samvadi": "Ni",
            "time_of_day": "First Prahar of Night", "mood": "Romantic, Uplifting",
            "scale_western": ["C", "D", "E", "F#", "G", "A", "B"],
            "scale_sargam": ["Sa", "Re", "Ga", "Ma(T)", "Pa", "Dha", "Ni"],
        },
        {
            "id": 3, "name": "Bhairav", "aliases": ["Mayamalavagowla"],
            "thaat": "Bhairav", "melakarta": 15,
            "aroha": "Sa Re(K) Ga Ma Pa Dha(K) Ni Sa'",
            "avaroha": "Sa' Ni Dha(K) Pa Ma Ga Re(K) Sa",
            "pakad": "Re(K) Ga, Ma Pa, Dha(K) Ma Pa",
            "vadi": "Dha(K)", "samvadi": "Re(K)",
            "time_of_day": "Dawn", "mood": "Solemn, Meditative",
            "scale_western": ["C", "Db", "E", "F", "G", "Ab", "B"],
            "scale_sargam": ["Sa", "Re(K)", "Ga", "Ma", "Pa", "Dha(K)", "Ni"],
        },
        {
            "id": 4, "name": "Bhimpalasi", "aliases": ["Abheri"],
            "thaat": "Kafi",
            "aroha": "Sa Ga Ma Pa Ni Sa'",
            "avaroha": "Sa' Ni Dha Pa Ma Ga Re Sa",
            "pakad": "Ma Pa Ni Dha Pa, Ma Ga Re Sa",
            "vadi": "Ma", "samvadi": "Sa",
            "time_of_day": "Afternoon", "mood": "Longing, Devotional",
            "scale_western": ["C", "D", "Eb", "F", "G", "A", "Bb"],
            "scale_sargam": ["Sa", "Re", "Ga(K)", "Ma", "Pa", "Dha", "Ni(K)"],
        },
        {
            "id": 5, "name": "Malkauns", "aliases": ["Hindolam"],
            "thaat": "Bhairavi",
            "aroha": "Sa Ga(K) Ma Dha(K) Ni(K) Sa'",
            "avaroha": "Sa' Ni(K) Dha(K) Ma Ga(K) Sa",
            "pakad": "Ma Dha(K) Ni(K) Dha(K) Ma Ga(K) Sa",
            "vadi": "Ma", "samvadi": "Sa",
            "time_of_day": "Late Night", "mood": "Serious, Mysterious",
            "scale_western": ["C", "Eb", "F", "Ab", "Bb"],
            "scale_sargam": ["Sa", "Ga(K)", "Ma", "Dha(K)", "Ni(K)"],
        },
        {
            "id": 6, "name": "Desh", "aliases": [],
            "thaat": "Khamaj",
            "aroha": "Sa Re Ma Pa Ni Sa'",
            "avaroha": "Sa' Ni Dha Pa Ma Ga Re Sa",
            "pakad": "Re Ma Pa, Pa Ni Dha Pa Ma Ga Re Sa",
            "vadi": "Pa", "samvadi": "Re",
            "time_of_day": "Second Prahar of Night", "mood": "Patriotic, Romantic",
            "scale_western": ["C", "D", "E", "F", "G", "A", "Bb"],
            "scale_sargam": ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni(K)"],
        },
    ]


@router.get(
    "",
    response_model=RagaListResponse,
    summary="Search raga dictionary",
)
async def lookup_raga(
    name: str | None = Query(None, description="Search by raga name"),
    thaat: str | None = Query(None, description="Filter by Thaat"),
    melakarta: int | None = Query(None, description="Filter by Melakarta number"),
):
    """Search the raga dictionary by name, thaat, or melakarta number."""
    ragas = _load_ragas()
    results = ragas

    if name:
        name_lower = name.lower()
        results = [
            r for r in results
            if name_lower in r["name"].lower()
            or any(name_lower in alias.lower() for alias in r.get("aliases", []))
        ]

    if thaat:
        thaat_lower = thaat.lower()
        results = [r for r in results if r.get("thaat", "").lower() == thaat_lower]

    if melakarta is not None:
        results = [r for r in results if r.get("melakarta") == melakarta]

    return RagaListResponse(
        ragas=[RagaDetail(**r) for r in results],
        total=len(results),
    )
