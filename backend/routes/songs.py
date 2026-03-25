from fastapi import APIRouter, HTTPException
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os

router = APIRouter(prefix="/api")

spotify_client_id = os.environ.get('SPOTIFY_CLIENT_ID')
spotify_client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET')

if spotify_client_id and spotify_client_secret:
    auth_manager = SpotifyClientCredentials(client_id=spotify_client_id, client_secret=spotify_client_secret)
    sp = spotipy.Spotify(auth_manager=auth_manager)
else:
    sp = None


@router.get("/songs/search")
async def search_songs(q: str):
    if not sp:
        raise HTTPException(status_code=500, detail="Spotify not configured")
    try:
        results = sp.search(q=q, limit=10, type='track')
        songs = []
        for item in results['tracks']['items']:
            songs.append({
                "id": item['id'],
                "name": item['name'],
                "artist": ", ".join([a['name'] for a in item['artists']]),
                "album": item['album']['name'],
                "duration_ms": item['duration_ms'],
                "album_art": item['album']['images'][0]['url'] if item['album']['images'] else None,
                "spotify_uri": item['uri'],
                "preview_url": item.get('preview_url')
            })
        return {"songs": songs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/songs/playlists")
async def get_playlists():
    if not sp:
        return {"playlists": []}
    try:
        results = sp.search(q='party hits', type='playlist', limit=3, market='US')
        playlists = []
        for item in results['playlists']['items']:
            if not item:
                continue
            playlists.append({
                "id": item['id'],
                "name": item['name'],
                "description": item.get('description', ''),
                "image": item['images'][0]['url'] if item.get('images') else 'https://via.placeholder.com/300'
            })
        return {"playlists": playlists}
    except Exception:
        return {"playlists": [{"id": "5xS3Gi0fA3Uo6RScucyct6", "name": "Party Songs", "description": "2010-2025 Party Hits", "image": "https://via.placeholder.com/300"}]}


@router.get("/songs/playlist/{playlist_id}")
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
            songs.append({
                "id": track['id'],
                "name": track['name'],
                "artist": ", ".join([a['name'] for a in track['artists']]),
                "album": track['album']['name'],
                "duration_ms": track['duration_ms'],
                "album_art": track['album']['images'][0]['url'] if track['album']['images'] else None,
                "spotify_uri": track['uri'],
                "preview_url": track.get('preview_url')
            })
        return {"songs": songs}
    except spotipy.exceptions.SpotifyException as e:
        if e.http_status == 404:
            raise HTTPException(status_code=404, detail="Playlist not found")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
