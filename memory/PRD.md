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
    admin.py         # Login, settings, change password, download proxy
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
    SpotifyPlayer.js       # Playback controls + Now Playing
```

## Key DB Collections
- `queue`: Song queue items (id, song, status, requested_by, requested_at)
- `spotify_tokens`: Stored OAuth tokens (admin_token, access_token, refresh_token, expires_at)
- `settings`: Key-value settings (admin_password, venue_name)

## Completed Features
- Full cyberpunk UI rebrand (custom fonts, logos, animations)
- Song search via Spotify API (10 result limit for dev mode)
- Queue management (add, skip, remove, clear, play-next)
- Now Playing card (works with or without Spotify connected, updates on skip/add)
- Admin authentication (DB-backed, changeable password)
- Admin settings (venue name, Spotify connection, system info, replay tutorial)
- Interactive onboarding with spotlight/tooltip highlighting
- QR code generator (points to queueit.live/request)
- PWA support for mobile admin (service worker v3 — network-first for HTML)
- Desktop app (Electron) with Windows .exe and Mac .dmg installers
- Download proxy via GitHub Releases (clean filenames: queueit_setup.exe/.dmg)
- Post-download page with install instructions
- White-labeled (no Emergent branding)
- Backend refactored into modular route files
- Spotify redirect URI set to queueit.live/admin

## Backlog / Remaining Tasks

### P2 - Nice to Have
- Analytics dashboard (most requested songs, peak hours)
- Song voting/priority system
- Multiple venue support
- Advanced background animations (particle systems)
- Clarify Android/iOS native app vs PWA approach

## Changelog

### March 25-27, 2026
- **Fixed**: Spotify search `400 Invalid limit` — changed limit to 10 for dev mode
- **Fixed**: Now Playing card hidden when Spotify not connected — SpotifyPlayer always shows song info now
- **Fixed**: Now Playing card not updating — removed stale comparison logic in AdminDashboard
- **Fixed**: Spotify redirect URI changed from preview URL to `queueit.live/admin`
- **Fixed**: PWA service worker v3 — network-first for HTML navigation, prevents stale cache after deploy
- **Fixed**: `queue/clear` now clears ALL entries including playing
- **Fixed**: Backend crash from deleted download-website directory (removed StaticFiles mount)
- **Added**: Admin Settings (change password, venue name, replay tutorial)
- **Added**: Enhanced spotlight onboarding tutorial (desktop 5 steps, mobile 6 steps)
- **Added**: Mac DMG installer linked to download page
- **Added**: Download proxy via GitHub Releases with clean filenames
- **Added**: Auto-cleanup of old "played" DB entries (keeps last 20)
- **Refactored**: Backend split from 672-line monolith into modular routes
- **Removed**: Obsolete `/app/download-website/` directory
- **Cleaned**: Purged 84 stale DB entries
