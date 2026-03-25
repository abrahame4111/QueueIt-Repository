# QueueIt - Product Requirements Document

## Overview
QueueIt is a smart music queueing system for venues (hostels, bars, etc.) that lets guests request songs while admins control playback via Spotify. Full cyberpunk 2077 aesthetic.

## URL Structure
- `queueit.live/` — Landing/download page
- `queueit.live/request` — Customer song request portal
- `queueit.live/admin` — Admin dashboard
- `queueit.live/downloads/thanks` — Post-download page

## Tech Stack
- **Frontend**: React, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (modular routes), Motor (async MongoDB)
- **Database**: MongoDB
- **API**: Spotify Web API (OAuth 2.0 + Client Credentials)
- **Desktop**: Electron.js (user-built installers)
- **Mobile**: PWA (Progressive Web App)

## Code Architecture
```
/app/backend/
  server.py          # Entry point (~40 lines)
  database.py        # MongoDB connection + token helpers
  models.py          # Pydantic models
  auth.py            # Admin auth (DB-backed password)
  routes/
    admin.py         # Login, settings, change password
    queue.py         # Queue CRUD + cleanup
    songs.py         # Spotify search + playlists
    spotify.py       # OAuth, playback, devices

/app/frontend/src/
  pages/
    AdminDashboard.js    # Admin console + SettingsPanel
    CustomerHome.js      # Guest song request
    DownloadPage.js      # Landing page
    PostDownloadPage.js  # Post-download instructions
  components/
    OnboardingTutorial.js  # Spotlight-style onboarding
    QRCodeGenerator.js     # QR code for venue
    SpotifyPlayer.js       # Playback controls
```

## Key DB Collections
- `queue`: Song queue items (id, song, status, requested_by, requested_at)
- `spotify_tokens`: Stored OAuth tokens (admin_token, access_token, refresh_token, expires_at)
- `settings`: Key-value settings (admin_password, venue_name)

## Completed Features
- Full cyberpunk UI rebrand (custom fonts, logos, animations)
- Song search via Spotify API (10 result limit for dev mode)
- Queue management (add, skip, remove, clear, play-next)
- Admin authentication (DB-backed, changeable password)
- Admin settings (venue name, Spotify connection, system info)
- Interactive onboarding with spotlight/tooltip highlighting
- QR code generator (points to queueit.live/request)
- PWA support for mobile admin
- Desktop app (Electron) with Windows .exe and Mac .dmg installers
- Post-download page with install instructions
- White-labeled (no Emergent branding)

## Backlog / Remaining Tasks

### P1 - Medium Priority
- Enhanced onboarding with interactive tutorial (highlight actual UI elements)
- Admin settings page (change password, manage venue info)

### P2 - Nice to Have
- Analytics dashboard (most requested songs, peak hours)
- Multiple venue support
- Song voting/priority system
- Advanced background animations (particle systems)
- Clarify Android/iOS native app vs PWA approach
