# 🎵 Hostel Music Queue System

A real-time music queueing system built for hostels, allowing guests to request songs via QR codes and staff to manage playback from an admin dashboard.

## ✨ Features

### Customer Portal
- 🔍 **Song Search**: Search millions of songs via Spotify API
- 🎧 **Curated Playlists**: Browse party playlists perfect for hostel vibes
- 📋 **Live Queue**: See what's playing now and what's coming up
- 🎵 **Easy Requests**: One-tap song requests with instant feedback
- 📱 **Mobile-First**: Optimized for scanning QR codes on phones
- 🌙 **Dark Theme**: Cyberpunk-inspired neon design

### Admin Dashboard
- 🎮 **Playback Control**: Skip songs or clear the entire queue
- 📊 **Live Stats**: Monitor playing, queued, and total songs
- 🗑️ **Queue Management**: Remove individual songs from queue
- 🔐 **Secure Login**: Password-protected admin access
- 🔄 **Real-Time Updates**: Syncs automatically every 3 seconds

## 🚀 Tech Stack

- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend**: FastAPI (Python), Spotipy
- **Database**: MongoDB
- **Integration**: Spotify Web API

## 📋 Prerequisites

- Spotify Developer Account
- MongoDB instance
- Node.js & Python 3.11+

## 🔧 Setup Instructions

### 1. Spotify API Setup
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Note your **Client ID** and **Client Secret**

### 2. Backend Configuration
Edit `/app/backend/.env`:
```env
SPOTIFY_CLIENT_ID="your_spotify_client_id"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
ADMIN_PASSWORD="your_secure_password"
```

### 3. Access the App
- **Customer Portal**: `http://localhost:3000/`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Default Admin Password**: `hostel2024`

## 🎯 Usage

### For Guests
1. Scan QR code placed around the hostel
2. Browse or search for songs
3. Tap "REQUEST" to add to queue
4. Watch your song move up the queue!

### For Staff (Admin)
1. Navigate to `/admin`
2. Login with admin password (default: `hostel2024`)
3. Monitor the queue and control playback
4. Skip songs or clear queue as needed

## 📱 QR Code Setup

See [QR_CODE_SETUP.md](./QR_CODE_SETUP.md) for detailed instructions on generating and placing QR codes.

## 🎨 Design System

**Cyberpunk/Neon Party Theme**:
- **Primary**: Neon Cyan (`#00F0FF`)
- **Secondary**: Neon Magenta (`#FF00FF`)
- **Background**: Deep Black (`#050505`)
- **Fonts**: Syne, Manrope, JetBrains Mono

## 🔌 API Endpoints

### Public
- `GET /api/songs/search?q={query}` - Search Spotify
- `GET /api/songs/playlists` - Get playlists
- `GET /api/queue` - Get queue
- `POST /api/queue/add` - Add song

### Admin (auth required)
- `POST /api/admin/login` - Login
- `POST /api/queue/skip` - Skip song
- `POST /api/queue/clear` - Clear queue

## 🎵 Queue Logic

**FIFO (First-In-First-Out)**:
1. First requested song plays immediately
2. Additional requests queued in order
3. Auto-advance to next song
4. Admin can skip or clear anytime

## 🔐 Security

1. Change default admin password in `.env`
2. Keep Spotify credentials secure
3. Configure CORS for production

## 📊 Database Schema

**queue** collection:
```javascript
{
  "id": "uuid",
  "song": { "id", "name", "artist", "album", "duration_ms", ... },
  "requested_at": ISODate,
  "requested_by": "Guest",
  "status": "queued" | "playing" | "played"
}
```

## 🎉 Future Enhancements

- Voting system for queue order
- Spotify Web Playback integration
- User profiles
- Analytics dashboard
- Multi-venue support

---

**Made with ❤️ for hostel vibes in Goa** 🏖️🎵
