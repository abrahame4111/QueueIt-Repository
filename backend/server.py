from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Spotify setup for search (client credentials)
spotify_client_id = os.environ.get('SPOTIFY_CLIENT_ID')
spotify_client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET')
redirect_uri = os.environ.get('SPOTIFY_REDIRECT_URI', 'http://localhost:3000/admin')

if spotify_client_id and spotify_client_secret:
    auth_manager = SpotifyClientCredentials(
        client_id=spotify_client_id,
        client_secret=spotify_client_secret
    )
    sp = spotipy.Spotify(auth_manager=auth_manager)
else:
    sp = None

# Store user tokens in MongoDB instead of memory
async def save_spotify_token(admin_token, token_data):
    """Save Spotify token to database"""
    await db.spotify_tokens.update_one(
        {"admin_token": admin_token},
        {"$set": {
            "admin_token": admin_token,
            "access_token": token_data['access_token'],
            "refresh_token": token_data.get('refresh_token'),
            "expires_at": token_data['expires_at'],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )

async def get_spotify_token(admin_token):
    """Get Spotify token from database"""
    token_doc = await db.spotify_tokens.find_one({"admin_token": admin_token})
    if token_doc:
        return {
            'access_token': token_doc['access_token'],
            'refresh_token': token_doc.get('refresh_token'),
            'expires_at': token_doc['expires_at']
        }
    return None

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Song(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    artist: str
    album: str
    duration_ms: int
    album_art: Optional[str] = None
    spotify_uri: str
    preview_url: Optional[str] = None

class QueueItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    song: Song
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    requested_by: Optional[str] = None
    status: str = "queued"  # queued, playing, played

class QueueItemCreate(BaseModel):
    song: Song
    requested_by: Optional[str] = None

class AdminLogin(BaseModel):
    password: str

class AdminResponse(BaseModel):
    success: bool
    token: Optional[str] = None

class PlaybackRequest(BaseModel):
    track_uri: str
    device_id: Optional[str] = None

class PlaybackControl(BaseModel):
    action: str  # play, pause, next, previous, volume
    device_id: Optional[str] = None
    volume: Optional[int] = None

# Admin authentication
async def verify_admin(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    admin_password = os.environ.get('ADMIN_PASSWORD', 'hostel2024')
    
    if token != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return True

# Routes
@api_router.get("/")
async def root():
    return {"message": "Hostel Music Queue API"}

@api_router.post("/admin/login", response_model=AdminResponse)
async def admin_login(credentials: AdminLogin):
    admin_password = os.environ.get('ADMIN_PASSWORD', 'hostel2024')
    
    if credentials.password == admin_password:
        return AdminResponse(success=True, token=admin_password)
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

@api_router.get("/songs/search")
async def search_songs(q: str):
    if not sp:
        raise HTTPException(status_code=500, detail="Spotify not configured")
    
    try:
        results = sp.search(q=q, limit=20, type='track')
        songs = []
        
        for item in results['tracks']['items']:
            song = {
                "id": item['id'],
                "name": item['name'],
                "artist": ", ".join([artist['name'] for artist in item['artists']]),
                "album": item['album']['name'],
                "duration_ms": item['duration_ms'],
                "album_art": item['album']['images'][0]['url'] if item['album']['images'] else None,
                "spotify_uri": item['uri'],
                "preview_url": item.get('preview_url')
            }
            songs.append(song)
        
        return {"songs": songs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/songs/playlists")
async def get_playlists():
    if not sp:
        return {"playlists": []}
    
    try:
        # Search for popular party/hostel playlists
        results = sp.search(q='party hits', type='playlist', limit=3)
        playlists = []
        
        for item in results['playlists']['items']:
            if not item:
                continue
            playlist = {
                "id": item['id'],
                "name": item['name'],
                "description": item.get('description', ''),
                "image": item['images'][0]['url'] if item.get('images') else 'https://via.placeholder.com/300'
            }
            playlists.append(playlist)
        
        return {"playlists": playlists}
    except Exception as e:
        # Return fallback playlists if search fails
        playlists = [
            {
                "id": "5xS3Gi0fA3Uo6RScucyct6",
                "name": "Party Songs",
                "description": "2010-2025 Party Hits",
                "image": "https://via.placeholder.com/300"
            }
        ]
        return {"playlists": playlists}

@api_router.get("/songs/playlist/{playlist_id}")
async def get_playlist_tracks(playlist_id: str):
    if not sp:
        raise HTTPException(status_code=500, detail="Spotify not configured")
    
    try:
        results = sp.playlist_tracks(playlist_id, limit=50)
        songs = []
        
        for item in results['items']:
            track = item['track']
            if not track:
                continue
                
            song = {
                "id": track['id'],
                "name": track['name'],
                "artist": ", ".join([artist['name'] for artist in track['artists']]),
                "album": track['album']['name'],
                "duration_ms": track['duration_ms'],
                "album_art": track['album']['images'][0]['url'] if track['album']['images'] else None,
                "spotify_uri": track['uri'],
                "preview_url": track.get('preview_url')
            }
            songs.append(song)
        
        return {"songs": songs}
    except spotipy.exceptions.SpotifyException as e:
        if e.http_status == 404:
            raise HTTPException(status_code=404, detail="Playlist not found")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/queue")
async def get_queue():
    queue_items = await db.queue.find(
        {"status": {"$in": ["queued", "playing"]}}
    ).sort("requested_at", 1).to_list(100)
    
    for item in queue_items:
        item['_id'] = str(item['_id'])
        if isinstance(item['requested_at'], str):
            item['requested_at'] = datetime.fromisoformat(item['requested_at'])
    
    return {"queue": queue_items}

@api_router.get("/queue/current")
async def get_current_song():
    current = await db.queue.find_one({"status": "playing"})
    
    if current:
        current['_id'] = str(current['_id'])
        if isinstance(current['requested_at'], str):
            current['requested_at'] = datetime.fromisoformat(current['requested_at'])
    
    return {"current": current}

@api_router.post("/queue/add")
async def add_to_queue(item: QueueItemCreate):
    queue_item = QueueItem(
        song=item.song,
        requested_by=item.requested_by
    )
    
    doc = queue_item.model_dump()
    doc['requested_at'] = doc['requested_at'].isoformat()
    
    result = await db.queue.insert_one(doc)
    
    # If no song is currently playing, set this as playing
    current = await db.queue.find_one({"status": "playing"})
    if not current:
        await db.queue.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "playing"}}
        )
    
    return {"success": True, "id": str(result.inserted_id)}

@api_router.post("/queue/skip")
async def skip_song(admin: bool = Depends(verify_admin)):
    # Mark current song as played
    current = await db.queue.find_one({"status": "playing"})
    
    if current:
        await db.queue.update_one(
            {"_id": current['_id']},
            {"$set": {"status": "played"}}
        )
    
    # Get next queued song
    next_song = await db.queue.find_one(
        {"status": "queued"},
        sort=[("requested_at", 1)]
    )
    
    if next_song:
        await db.queue.update_one(
            {"_id": next_song['_id']},
            {"$set": {"status": "playing"}}
        )
        next_song['_id'] = str(next_song['_id'])
        return {"success": True, "next_song": next_song}
    
    return {"success": True, "next_song": None}

@api_router.post("/queue/clear")
async def clear_queue(admin: bool = Depends(verify_admin)):
    # Delete all queued songs (not the currently playing one)
    result = await db.queue.delete_many({"status": "queued"})
    return {"success": True, "deleted_count": result.deleted_count}

@api_router.delete("/queue/{item_id}")
async def remove_from_queue(item_id: str, admin: bool = Depends(verify_admin)):
    from bson import ObjectId
    
    try:
        result = await db.queue.delete_one({"_id": ObjectId(item_id)})
        return {"success": result.deleted_count > 0}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Playback Control Endpoints
@api_router.get("/playback/devices")
async def get_devices(admin: bool = Depends(verify_admin)):
    """Get available Spotify devices"""
    if not sp:
        raise HTTPException(status_code=500, detail="Spotify not configured")
    
    try:
        # Note: This requires OAuth token, not client credentials
        # For now, return empty list
        return {"devices": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/playback/play")
async def play_track(request: PlaybackRequest, admin: bool = Depends(verify_admin)):
    """Start playing a track"""
    if not sp:
        raise HTTPException(status_code=500, detail="Spotify not configured")
    
    try:
        # This endpoint would require OAuth with user permissions
        # For hostel use case, the admin would need to authenticate with their Spotify Premium account
        return {"success": True, "message": "Playback requires Spotify Premium account authentication"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/playback/control")
async def control_playback(request: PlaybackControl, admin: bool = Depends(verify_admin)):
    """Control playback (play/pause/volume)"""
    if not sp:
        raise HTTPException(status_code=500, detail="Spotify not configured")
    
    try:
        # This would require OAuth token with playback permissions
        return {"success": True, "action": request.action}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/spotify/auth-url")
async def get_spotify_auth_url(admin: bool = Depends(verify_admin)):
    """Generate Spotify OAuth URL"""
    scope = "user-read-playback-state user-modify-playback-state streaming user-read-currently-playing"
    
    auth_url = f"https://accounts.spotify.com/authorize?" + \
        f"client_id={spotify_client_id}&" + \
        f"response_type=code&" + \
        f"redirect_uri={redirect_uri}&" + \
        f"scope={scope}"
    
    return {"auth_url": auth_url}

@api_router.post("/spotify/callback")
async def spotify_callback(code: str, admin: bool = Depends(verify_admin)):
    """Handle Spotify OAuth callback"""
    import requests
    
    token_url = "https://accounts.spotify.com/api/token"
    
    response = requests.post(token_url, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': spotify_client_id,
        'client_secret': spotify_client_secret
    })
    
    if response.status_code == 200:
        token_data = response.json()
        # Store token in database
        token_info = {
            'access_token': token_data['access_token'],
            'refresh_token': token_data.get('refresh_token'),
            'expires_at': datetime.now(timezone.utc).timestamp() + token_data['expires_in']
        }
        await save_spotify_token("default_admin", token_info)
        return {"success": True, "access_token": token_data['access_token']}
    else:
        raise HTTPException(status_code=400, detail="Failed to get access token")

@api_router.get("/spotify/token")
async def check_spotify_token(authorization: Optional[str] = Header(None)):
    """Get stored Spotify access token"""
    if not authorization:
        return {"has_token": False}
    
    token_data = await get_spotify_token("default_admin")
    
    if token_data:
        # Check if token expired
        if token_data['expires_at'] < datetime.now(timezone.utc).timestamp():
            # Refresh token
            if token_data.get('refresh_token'):
                import requests
                response = requests.post("https://accounts.spotify.com/api/token", data={
                    'grant_type': 'refresh_token',
                    'refresh_token': token_data['refresh_token'],
                    'client_id': spotify_client_id,
                    'client_secret': spotify_client_secret
                })
                
                if response.status_code == 200:
                    new_token_data = response.json()
                    token_info = {
                        'access_token': new_token_data['access_token'],
                        'refresh_token': token_data['refresh_token'],
                        'expires_at': datetime.now(timezone.utc).timestamp() + new_token_data['expires_in']
                    }
                    await save_spotify_token("default_admin", token_info)
                    return {"has_token": True, "access_token": new_token_data['access_token']}
        
        return {"has_token": True, "access_token": token_data['access_token']}
    
    return {"has_token": False}

@api_router.post("/spotify/play")
async def spotify_play_track(request: PlaybackRequest, authorization: Optional[str] = Header(None)):
    """Play a track on user's Spotify"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    admin_token = authorization.replace("Bearer ", "")
    token_data = user_tokens.get(admin_token)
    
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")
    
    import requests
    
    play_url = "https://api.spotify.com/v1/me/player/play"
    headers = {
        'Authorization': f"Bearer {token_data['access_token']}",
        'Content-Type': 'application/json'
    }
    
    body = {"uris": [request.track_uri]}
    if request.device_id:
        play_url += f"?device_id={request.device_id}"
    
    response = requests.put(play_url, headers=headers, json=body)
    
    if response.status_code in [200, 204]:
        return {"success": True}
    elif response.status_code == 404:
        raise HTTPException(status_code=404, detail="No active device found. Please open Spotify on your device.")
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

@api_router.post("/spotify/pause")
async def spotify_pause(authorization: Optional[str] = Header(None)):
    """Pause Spotify playback"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    admin_token = authorization.replace("Bearer ", "")
    token_data = user_tokens.get(admin_token)
    
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")
    
    import requests
    
    response = requests.put(
        "https://api.spotify.com/v1/me/player/pause",
        headers={'Authorization': f"Bearer {token_data['access_token']}"}
    )
    
    if response.status_code in [200, 204]:
        return {"success": True}
    else:
        raise HTTPException(status_code=response.status_code, detail="Failed to pause")

@api_router.post("/spotify/resume")
async def spotify_resume(authorization: Optional[str] = Header(None)):
    """Resume Spotify playback"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    admin_token = authorization.replace("Bearer ", "")
    token_data = user_tokens.get(admin_token)
    
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")
    
    import requests
    
    response = requests.put(
        "https://api.spotify.com/v1/me/player/play",
        headers={'Authorization': f"Bearer {token_data['access_token']}"}
    )
    
    if response.status_code in [200, 204]:
        return {"success": True}
    else:
        raise HTTPException(status_code=response.status_code, detail="Failed to resume")

@api_router.get("/spotify/devices")
async def get_spotify_devices(authorization: Optional[str] = Header(None)):
    """Get available Spotify devices"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    admin_token = authorization.replace("Bearer ", "")
    token_data = user_tokens.get(admin_token)
    
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")
    
    import requests
    
    response = requests.get(
        "https://api.spotify.com/v1/me/player/devices",
        headers={'Authorization': f"Bearer {token_data['access_token']}"}
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"devices": []}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()