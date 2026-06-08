from fastapi import APIRouter, Depends, HTTPException
from database import db
from auth import verify_admin
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/filters")

PRESETS = {
    "fine_dining": {
        "label": "Fine Dining",
        "icon": "wine",
        "genres": ["jazz", "classical", "bossa nova", "acoustic", "soul", "lounge", "swing", "easy listening"],
        "moods": ["relaxed", "elegant", "romantic", "smooth", "ambient", "sophisticated", "gentle"],
        "energy": "low",
        "description": "Refined atmosphere for upscale dining"
    },
    "club": {
        "label": "Club Night",
        "icon": "zap",
        "genres": ["edm", "house", "techno", "dance", "electronic", "trance", "drum and bass", "dubstep", "disco"],
        "moods": ["energetic", "hype", "party", "intense", "euphoric", "powerful", "aggressive"],
        "energy": "high",
        "description": "High-energy tracks for the dancefloor"
    },
    "cafe": {
        "label": "Cafe Chill",
        "icon": "coffee",
        "genres": ["lo-fi", "indie", "acoustic", "soul", "folk", "singer-songwriter", "soft pop", "chillhop", "ambient"],
        "moods": ["chill", "mellow", "warm", "cozy", "dreamy", "peaceful", "laid-back"],
        "energy": "low",
        "description": "Relaxed vibes for coffee shops and cafes"
    },
    "bar": {
        "label": "Bar / Pub",
        "icon": "beer",
        "genres": ["rock", "pop", "hip-hop", "r&b", "funk", "blues", "alternative", "indie rock", "classic rock", "reggae"],
        "moods": ["upbeat", "fun", "groovy", "confident", "social", "nostalgic", "feel-good"],
        "energy": "medium",
        "description": "Crowd-pleasing mix for bars and pubs"
    },
    "open": {
        "label": "Open",
        "icon": "music",
        "genres": [],
        "moods": [],
        "energy": "any",
        "description": "No restrictions — anything goes"
    }
}

ALL_GENRES = sorted(list(set(
    g for p in PRESETS.values() for g in p["genres"]
)))

ALL_MOODS = sorted(list(set(
    m for p in PRESETS.values() for m in p["moods"]
)))


class FilterUpdate(BaseModel):
    mode: Optional[str] = None  # "strict" or "open"
    preset: Optional[str] = None
    genres: Optional[list] = None
    moods: Optional[list] = None


@router.get("/presets")
async def get_presets():
    return {"presets": PRESETS, "all_genres": ALL_GENRES, "all_moods": ALL_MOODS}


@router.get("")
async def get_filters():
    """Public endpoint — customers need to know active filters."""
    config = await db.venue_filters.find_one({"key": "active"}, {"_id": 0})
    if not config:
        return {
            "mode": "open",
            "preset": "open",
            "genres": [],
            "moods": [],
            "energy": "any",
            "label": "Open"
        }
    return {
        "mode": config.get("mode", "open"),
        "preset": config.get("preset", "open"),
        "genres": config.get("genres", []),
        "moods": config.get("moods", []),
        "energy": config.get("energy", "any"),
        "label": config.get("label", "Open")
    }


@router.put("")
async def update_filters(req: FilterUpdate, admin: bool = Depends(verify_admin)):
    current = await db.venue_filters.find_one({"key": "active"})
    update = {}

    if req.preset and req.preset in PRESETS:
        p = PRESETS[req.preset]
        update = {
            "mode": req.mode or (current or {}).get("mode", "open"),
            "preset": req.preset,
            "genres": p["genres"],
            "moods": p["moods"],
            "energy": p["energy"],
            "label": p["label"],
        }
    else:
        update = {
            "mode": req.mode or (current or {}).get("mode", "open"),
            "preset": "custom",
            "genres": req.genres if req.genres is not None else (current or {}).get("genres", []),
            "moods": req.moods if req.moods is not None else (current or {}).get("moods", []),
            "energy": "custom",
            "label": "Custom",
        }

    update["key"] = "active"
    await db.venue_filters.update_one(
        {"key": "active"},
        {"$set": update},
        upsert=True
    )
    logger.info(f"Filters updated: preset={update.get('preset')}, mode={update.get('mode')}")
    return {"success": True, **{k: v for k, v in update.items() if k != "key"}}
