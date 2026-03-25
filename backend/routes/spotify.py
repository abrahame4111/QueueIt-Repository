from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
from datetime import datetime, timezone
from models import PlaybackRequest
from database import db, save_spotify_token, get_spotify_token
from auth import verify_admin
import os
import logging
import requests as http_requests

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

spotify_client_id = os.environ.get('SPOTIFY_CLIENT_ID')
spotify_client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET')
redirect_uri = os.environ.get('SPOTIFY_REDIRECT_URI', 'http://localhost:3000/admin')


@router.get("/spotify/auth-url")
async def get_spotify_auth_url(admin: bool = Depends(verify_admin)):
    scope = "user-read-playback-state user-modify-playback-state streaming user-read-currently-playing"
    auth_url = (
        f"https://accounts.spotify.com/authorize?"
        f"client_id={spotify_client_id}&"
        f"response_type=code&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope}&"
        f"show_dialog=true"
    )
    return {"auth_url": auth_url}


@router.post("/spotify/callback")
async def spotify_callback(code: str, admin: bool = Depends(verify_admin)):
    response = http_requests.post("https://accounts.spotify.com/api/token", data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': spotify_client_id,
        'client_secret': spotify_client_secret
    })
    if response.status_code == 200:
        token_data = response.json()
        token_info = {
            'access_token': token_data['access_token'],
            'refresh_token': token_data.get('refresh_token'),
            'expires_at': datetime.now(timezone.utc).timestamp() + token_data['expires_in']
        }
        await save_spotify_token("default_admin", token_info)
        return {"success": True, "access_token": token_data['access_token']}
    else:
        raise HTTPException(status_code=400, detail="Failed to get access token")


@router.get("/spotify/token")
async def check_spotify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        return {"has_token": False}
    token_data = await get_spotify_token("default_admin")
    if token_data:
        if token_data['expires_at'] < datetime.now(timezone.utc).timestamp():
            if token_data.get('refresh_token'):
                response = http_requests.post("https://accounts.spotify.com/api/token", data={
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


@router.post("/spotify/logout")
async def spotify_logout(admin: bool = Depends(verify_admin)):
    result = await db.spotify_tokens.delete_many({"admin_token": "default_admin"})
    return {"success": True, "message": "Logged out from Spotify.", "tokens_removed": result.deleted_count}


@router.post("/spotify/play")
async def spotify_play_track(request: PlaybackRequest, authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token_data = await get_spotify_token("default_admin")
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")

    play_url = "https://api.spotify.com/v1/me/player/play"
    headers = {'Authorization': f"Bearer {token_data['access_token']}", 'Content-Type': 'application/json'}
    body = {"uris": [request.track_uri]}
    if request.device_id:
        play_url += f"?device_id={request.device_id}"

    response = http_requests.put(play_url, headers=headers, json=body)
    if response.status_code in [200, 204]:
        return {"success": True}
    elif response.status_code == 404:
        raise HTTPException(status_code=404, detail="No active device found. Please open Spotify on your device.")
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


@router.post("/spotify/pause")
async def spotify_pause(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token_data = await get_spotify_token("default_admin")
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")

    response = http_requests.put(
        "https://api.spotify.com/v1/me/player/pause",
        headers={'Authorization': f"Bearer {token_data['access_token']}"}
    )
    if response.status_code in [200, 204]:
        return {"success": True}
    raise HTTPException(status_code=response.status_code, detail="Failed to pause")


@router.post("/spotify/resume")
async def spotify_resume(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token_data = await get_spotify_token("default_admin")
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")

    response = http_requests.put(
        "https://api.spotify.com/v1/me/player/play",
        headers={'Authorization': f"Bearer {token_data['access_token']}"}
    )
    if response.status_code in [200, 204]:
        return {"success": True}
    raise HTTPException(status_code=response.status_code, detail="Failed to resume")


@router.get("/spotify/devices")
async def get_spotify_devices(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token_data = await get_spotify_token("default_admin")
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")

    response = http_requests.get(
        "https://api.spotify.com/v1/me/player/devices",
        headers={'Authorization': f"Bearer {token_data['access_token']}"}
    )
    if response.status_code == 200:
        return response.json()
    return {"devices": []}


@router.get("/spotify/playback-state")
async def get_playback_state(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token_data = await get_spotify_token("default_admin")
    if not token_data:
        raise HTTPException(status_code=401, detail="No Spotify token found")

    response = http_requests.get(
        "https://api.spotify.com/v1/me/player",
        headers={'Authorization': f"Bearer {token_data['access_token']}"}
    )
    if response.status_code == 200:
        return response.json()
    return {"is_playing": False, "item": None}
