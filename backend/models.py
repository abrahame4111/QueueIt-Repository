from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


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
    status: str = "queued"


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


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class VenueSettingsUpdate(BaseModel):
    venue_name: Optional[str] = None
