# Spotify Integration Setup Guide

## Prerequisites
- Spotify Premium account (required for playback control)
- Spotify Developer account

## Step 1: Configure Spotify App Settings

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app (or create a new one)
3. Click **"Settings"** or **"Edit Settings"**
4. Add the following to **Redirect URIs**:
   ```
   http://localhost:3000/admin
   ```
   For production, add your production URL:
   ```
   https://your-domain.com/admin
   ```
5. Click **"Add"** and then **"Save"**

## Step 2: Update Environment Variables

Your backend `.env` already has:
```env
SPOTIFY_CLIENT_ID="df14f22ccdc24f0ea4ed90e1e993e35d"
SPOTIFY_CLIENT_SECRET="c3fdb4704ab54b03b9bf5d9e70048e48"
SPOTIFY_REDIRECT_URI="http://localhost:3000/admin"
```

For production, update `SPOTIFY_REDIRECT_URI` to your production URL.

## Step 3: Login Flow

### For Admin:
1. Navigate to `/admin` and login with admin password
2. Click **"LOGIN WITH SPOTIFY"** button
3. You'll be redirected to Spotify's authorization page
4. Login with your **Spotify Premium** account
5. Authorize the app
6. You'll be redirected back to the admin dashboard
7. The system will now control Spotify playback on your devices

## Step 4: Connect a Playback Device

After logging in with Spotify, you need an active device:

### Option 1: Laptop/Computer
1. Open Spotify app on your laptop
2. Play any song briefly (then you can pause it)
3. The admin dashboard will now detect this device
4. Songs from the queue will play on your laptop

### Option 2: Bluetooth Speaker
1. Connect Bluetooth speaker to your laptop
2. Open Spotify app
3. Click the device icon in Spotify
4. Select your Bluetooth speaker
5. Play any song briefly to activate the device
6. The admin dashboard will now control playback on the speaker

### Option 3: Phone
1. Open Spotify app on your phone (same WiFi network)
2. Play any song briefly
3. The dashboard will detect your phone as a device
4. Songs will play on your phone

## How It Works

### Customer Portal (/)
- Customers scan QR codes
- Search and request songs
- Songs are added to MongoDB queue

### Admin Dashboard (/admin)
- Shows all requested songs
- Controls Spotify playback via API
- When a song is at the front of the queue:
  1. System calls Spotify API to play the song
  2. Song plays on your active Spotify device
  3. Admin can pause/resume playback
  4. Admin can skip to next song
  5. Admin can clear the queue

### Real-Time Sync
- Queue updates every 3 seconds
- Multiple customers can request songs simultaneously
- Admin sees all requests in real-time

## Playback Controls

Once connected to Spotify:

| Control | Action |
|---------|--------|
| Play/Pause Button | Toggle playback on active device |
| Skip Button | Skip to next song in queue |
| Clear All | Remove all queued songs |
| Remove Song | Remove specific song from queue |

## Troubleshooting

### "No active Spotify device found"
**Solution**: Open Spotify app on any device (laptop/phone) and play any song briefly

### "Failed to start playback"
**Solution**: 
- Ensure you're logged in with Spotify Premium account
- Check that Spotify app is open on at least one device
- Try refreshing the page

### Songs not auto-playing
**Solution**: The current implementation requires manual skip to next song. Auto-advance will be added in future updates.

### "Invalid redirect URI"
**Solution**: Make sure you added the redirect URI in Spotify Dashboard settings (Step 1)

## API Endpoints

### Authentication
- `GET /api/spotify/auth-url` - Get Spotify OAuth URL
- `POST /api/spotify/callback?code=` - Handle OAuth callback

### Playback Control
- `POST /api/spotify/play` - Play track on active device
- `POST /api/spotify/pause` - Pause playback
- `POST /api/spotify/resume` - Resume playback
- `GET /api/spotify/devices` - Get available devices

### Token Management
- `GET /api/spotify/token` - Check if user has valid token

## Security Notes

1. **Tokens are stored in memory** - They're lost when server restarts
2. **For production**, use Redis or database to persist tokens
3. **Admin authentication** - Only authenticated admins can control playback
4. **Spotify Premium required** - Free accounts cannot use playback API

## Spotify API Scopes

The app requests these permissions:
- `user-read-playback-state` - Read current playback state
- `user-modify-playback-state` - Control playback (play/pause/skip)
- `streaming` - Stream audio content
- `user-read-currently-playing` - Read currently playing track

## Next Steps

1. Add auto-advance to next song when current finishes
2. Add volume control
3. Add seek/scrubbing
4. Show real-time playback progress
5. Support multiple concurrent admin sessions
6. Add webhook for song end detection

---

**Note**: This is a Spotify controller app. It controls Spotify on your existing devices - it doesn't stream audio itself. You need Spotify app open on at least one device (laptop/phone/speaker) for playback to work.
