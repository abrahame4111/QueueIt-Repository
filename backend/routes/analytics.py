from fastapi import APIRouter, Depends
from database import db
from auth import verify_admin
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analytics")


async def log_event(song: dict, action: str, requested_by: str = None):
    """Log a song event to the analytics collection."""
    doc = {
        "song_id": song.get("id", ""),
        "song_name": song.get("name", "Unknown"),
        "song_artist": song.get("artist", "Unknown"),
        "album_art": song.get("album_art", ""),
        "requested_by": requested_by or "Unknown",
        "action": action,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.analytics_log.insert_one(doc)


@router.get("/overview")
async def get_overview(admin: bool = Depends(verify_admin)):
    total_requests = await db.analytics_log.count_documents({"action": "request"})
    total_played = await db.analytics_log.count_documents({"action": "play"})

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    requests_today = await db.analytics_log.count_documents({
        "action": "request",
        "timestamp": {"$gte": today_start}
    })

    unique_songs_pipeline = [
        {"$match": {"action": "request"}},
        {"$group": {"_id": "$song_id"}},
        {"$count": "count"}
    ]
    unique_songs_result = await db.analytics_log.aggregate(unique_songs_pipeline).to_list(1)
    unique_songs = unique_songs_result[0]["count"] if unique_songs_result else 0

    unique_requesters_pipeline = [
        {"$match": {"action": "request"}},
        {"$group": {"_id": "$requested_by"}},
        {"$count": "count"}
    ]
    unique_requesters_result = await db.analytics_log.aggregate(unique_requesters_pipeline).to_list(1)
    unique_requesters = unique_requesters_result[0]["count"] if unique_requesters_result else 0

    return {
        "total_requests": total_requests,
        "total_played": total_played,
        "requests_today": requests_today,
        "unique_songs": unique_songs,
        "unique_requesters": unique_requesters,
    }


@router.get("/top-songs")
async def get_top_songs(admin: bool = Depends(verify_admin)):
    pipeline = [
        {"$match": {"action": "request"}},
        {"$group": {
            "_id": "$song_id",
            "name": {"$first": "$song_name"},
            "artist": {"$first": "$song_artist"},
            "album_art": {"$first": "$album_art"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10},
        {"$project": {"_id": 0, "song_id": "$_id", "name": 1, "artist": 1, "album_art": 1, "count": 1}}
    ]
    results = await db.analytics_log.aggregate(pipeline).to_list(10)
    return {"top_songs": results}


@router.get("/hourly")
async def get_hourly_distribution(admin: bool = Depends(verify_admin)):
    pipeline = [
        {"$match": {"action": "request"}},
        {"$addFields": {
            "parsed_ts": {"$dateFromString": {"dateString": "$timestamp"}}
        }},
        {"$group": {
            "_id": {"$hour": "$parsed_ts"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "hour": "$_id", "count": 1}}
    ]
    results = await db.analytics_log.aggregate(pipeline).to_list(24)
    # Fill in missing hours with 0
    hour_map = {r["hour"]: r["count"] for r in results}
    hourly = [{"hour": h, "count": hour_map.get(h, 0)} for h in range(24)]
    return {"hourly": hourly}


@router.get("/daily")
async def get_daily_activity(admin: bool = Depends(verify_admin)):
    now = datetime.now(timezone.utc)
    seven_days_ago = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    pipeline = [
        {"$match": {"action": "request", "timestamp": {"$gte": seven_days_ago}}},
        {"$addFields": {
            "parsed_ts": {"$dateFromString": {"dateString": "$timestamp"}}
        }},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$parsed_ts"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "date": "$_id", "count": 1}}
    ]
    results = await db.analytics_log.aggregate(pipeline).to_list(7)

    # Fill missing days with 0
    daily = []
    for i in range(7):
        d = (now - timedelta(days=6 - i)).strftime("%Y-%m-%d")
        found = next((r for r in results if r["date"] == d), None)
        daily.append({"date": d, "count": found["count"] if found else 0})

    return {"daily": daily}


@router.get("/recent")
async def get_recent_activity(admin: bool = Depends(verify_admin)):
    cursor = db.analytics_log.find(
        {},
        {"_id": 0, "song_name": 1, "song_artist": 1, "album_art": 1, "requested_by": 1, "action": 1, "timestamp": 1}
    ).sort("timestamp", -1).limit(20)
    results = await cursor.to_list(20)
    return {"recent": results}
