from fastapi import APIRouter, HTTPException, Depends
from models import QueueItem, QueueItemCreate
from database import db
from auth import verify_admin
from models import Song
from routes.analytics import log_event
from datetime import timezone
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


@router.get("/queue")
async def get_queue():
    queue_items = await db.queue.find(
        {"status": {"$in": ["queued", "playing"]}}
    ).sort("requested_at", 1).to_list(100)
    for item in queue_items:
        item['_id'] = str(item['_id'])
        if isinstance(item['requested_at'], str):
            item['requested_at'] = datetime.fromisoformat(item['requested_at'])
    return {"queue": queue_items}


@router.get("/queue/current")
async def get_current_song():
    current = await db.queue.find_one({"status": "playing"})
    if current:
        current['_id'] = str(current['_id'])
        if isinstance(current['requested_at'], str):
            current['requested_at'] = datetime.fromisoformat(current['requested_at'])
    return {"current": current}


@router.post("/queue/add")
async def add_to_queue(item: QueueItemCreate):
    queue_item = QueueItem(song=item.song, requested_by=item.requested_by)
    doc = queue_item.model_dump()
    doc['requested_at'] = doc['requested_at'].isoformat()
    result = await db.queue.insert_one(doc)

    # Log the request event for analytics
    await log_event(item.song.model_dump(), "request", item.requested_by)

    current = await db.queue.find_one({"status": "playing"})
    if not current:
        await db.queue.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "playing"}}
        )
        await log_event(item.song.model_dump(), "play", item.requested_by)

    # Cleanup old played entries (keep last 20)
    played_count = await db.queue.count_documents({"status": "played"})
    if played_count > 20:
        old_played = db.queue.find({"status": "played"}).sort("requested_at", 1).limit(played_count - 20)
        old_ids = [doc["_id"] async for doc in old_played]
        if old_ids:
            await db.queue.delete_many({"_id": {"$in": old_ids}})

    return {"success": True, "id": str(result.inserted_id)}


@router.post("/queue/skip")
async def skip_song(admin: bool = Depends(verify_admin)):
    current = await db.queue.find_one({"status": "playing"})
    if current:
        logger.info(f"Skip: Marking as played - {current.get('song', {}).get('name')}")
        await db.queue.update_one({"_id": current['_id']}, {"$set": {"status": "played"}})

    next_song = await db.queue.find_one({"status": "queued"}, sort=[("requested_at", 1)])
    if next_song:
        logger.info(f"Skip: Setting as playing - {next_song.get('song', {}).get('name')}")
        await db.queue.update_one({"_id": next_song['_id']}, {"$set": {"status": "playing"}})
        await log_event(next_song.get("song", {}), "play", next_song.get("requested_by"))
        next_song['_id'] = str(next_song['_id'])
        return {"success": True, "next_song": next_song}

    return {"success": True, "next_song": None}


@router.post("/queue/clear")
async def clear_queue(admin: bool = Depends(verify_admin)):
    result = await db.queue.delete_many({})
    return {"success": True, "deleted_count": result.deleted_count}


@router.delete("/queue/{item_id}")
async def remove_from_queue(item_id: str, admin: bool = Depends(verify_admin)):
    from bson import ObjectId
    try:
        result = await db.queue.delete_one({"_id": ObjectId(item_id)})
        return {"success": result.deleted_count > 0}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/queue/{item_id}/play-next")
async def play_next(item_id: str, admin: bool = Depends(verify_admin)):
    from bson import ObjectId
    try:
        song_to_move = await db.queue.find_one({"_id": ObjectId(item_id)})
        if not song_to_move:
            raise HTTPException(status_code=404, detail="Song not found")
        current = await db.queue.find_one({"status": "playing"})
        if not current:
            return {"success": False, "message": "No song currently playing"}
        current_time = current['requested_at']
        if isinstance(current_time, str):
            current_time = datetime.fromisoformat(current_time)
        new_time = current_time.replace(microsecond=(current_time.microsecond + 1000) % 1000000)
        await db.queue.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": {"requested_at": new_time.isoformat()}}
        )
        return {"success": True, "message": "Song moved to play next"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/queue/sync-spotify")
async def sync_spotify_track(body: dict, admin: bool = Depends(verify_admin)):
    """Sync the queue with what's actually playing on Spotify."""
    track = body.get("track")
    if not track or not track.get("spotify_uri"):
        return {"success": False, "message": "No track data"}

    spotify_uri = track["spotify_uri"]

    # Check if this track is already the current playing song
    current = await db.queue.find_one({"status": "playing"})
    if current and current.get("song", {}).get("spotify_uri") == spotify_uri:
        return {"success": True, "message": "Already in sync", "changed": False}

    # Mark current playing as played
    if current:
        await db.queue.update_one({"_id": current["_id"]}, {"$set": {"status": "played"}})

    # Check if this track is queued — if so, promote it to playing
    queued = await db.queue.find_one({"status": "queued", "song.spotify_uri": spotify_uri})
    if queued:
        await db.queue.update_one({"_id": queued["_id"]}, {"$set": {"status": "playing"}})
        await log_event(queued["song"], "play", queued.get("requested_by"))
        logger.info(f"Sync: Promoted queued song to playing - {queued['song']['name']}")
        return {"success": True, "message": "Promoted queued song", "changed": True}

    # Not in queue — create a new entry from Spotify data
    new_item = {
        "id": str(uuid.uuid4()),
        "song": {
            "id": track.get("id", ""),
            "name": track.get("name", "Unknown"),
            "artist": track.get("artist", "Unknown"),
            "album": track.get("album", ""),
            "duration_ms": track.get("duration_ms", 0),
            "album_art": track.get("album_art"),
            "spotify_uri": spotify_uri,
        },
        "requested_by": "Spotify",
        "requested_at": datetime.now(timezone.utc).isoformat(),
        "status": "playing",
    }
    await db.queue.insert_one(new_item)
    await log_event(new_item["song"], "play", "Spotify")
    logger.info(f"Sync: Created new playing entry from Spotify - {track.get('name')}")
    return {"success": True, "message": "Synced from Spotify", "changed": True}
