# QueueIt - Product Requirements Document

## Overview
QueueIt is a smart music queueing system for venues (hostels, bars, etc.) that lets guests request songs while admins control playback via Spotify. Full cyberpunk 2077 aesthetic (yellow/black/neon-blue).

## URL Structure
- `queueit.live/` — Landing/download page
- `queueit.live/request` — Customer song request portal
- `queueit.live/admin` — Admin dashboard
- `queueit.live/admin/starter-kit` — Print materials generator
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
    queue.py         # Queue CRUD + cleanup + analytics logging
    songs.py         # Spotify search + playlists
    spotify.py       # OAuth, playback, devices
    analytics.py     # Analytics endpoints + event logging

/app/frontend/src/
  pages/
    AdminDashboard.js    # Admin console + SettingsPanel
    CustomerHome.js      # Guest song request
    DownloadPage.js      # Landing page
    PostDownloadPage.js  # Post-download instructions
    StarterKit.js        # Print materials generator (stickers, cards, posters, brochure)
  components/
    AnalyticsDashboard.js  # Analytics charts & stats
    OnboardingTutorial.js  # Spotlight-style onboarding
    QRCodeGenerator.js     # QR code for venue
    SpotifyPlayer.js       # Playback controls + Now Playing
```

## Key DB Collections
- `queue`: Song queue items (id, song, status, requested_by, requested_at)
- `spotify_tokens`: Stored OAuth tokens (admin_token, access_token, refresh_token, expires_at)
- `settings`: Key-value settings (admin_password, venue_name)
- `analytics_log`: Permanent event log (song_id, song_name, artist, album_art, requested_by, action, timestamp)

## Completed Features
- Full cyberpunk UI rebrand (custom fonts, logos, animations)
- Song search via Spotify API (10 result limit for dev mode)
- Queue management (add, skip, remove, clear, play-next)
- Now Playing card (stable, no flickering on polling)
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
- Spotify redirect URI dynamically set from window.location.origin
- Auto-sync with native Spotify app track changes
- **Analytics Dashboard** (total requests, played, today, unique guests, top songs, hourly distribution, daily activity, recent activity feed)
- **Starter Kit** print materials generator (QR stickers 9/sheet, standing cards, A4 posters, tri-fold brochure with setup guide, FAQ, scope & limitations, flow diagram)

## Backlog / Remaining Tasks

### P1 - Upcoming
- Song voting/priority system (customers upvote queued songs)

### P2 - Nice to Have
- Multiple venue support (different queues per location)
- Advanced background animations (particle systems)
- SEO meta tags for landing page
- Full app color palette redesign to yellow/black/neon-blue (user requested)

## Changelog

### March 30, 2026
- **Added**: Analytics Dashboard with 5 backend endpoints (overview, top-songs, hourly, daily, recent)
- **Added**: Analytics event logging in queue routes (request/play events)
- **Added**: Analytics visualization in admin panel (desktop & mobile STATS tab)
- **Added**: Starter Kit page (/admin/starter-kit) with 4 print material generators
- **Added**: QR Stickers (9 per A4 sheet, cut-to-size)
- **Added**: Standing Cards (table tent format, fold & stand)
- **Added**: A4 Poster (full poster with QR, corner marks, steps)
- **Added**: Tri-fold Brochure (setup guide, FAQ, flow diagram, scope & limitations, Spotify Premium requirement)
- **Added**: Starter Kit button in admin QR section (desktop & mobile)
- **Fixed**: Customer search results flickering (removed motion.div from SongCard)
- **Fixed**: Customer Now Playing album art image source
- **Fixed**: Electron menu Spotify login/switch now passes redirect_uri properly
- **Updated**: Mobile tab bar now has 5 tabs (PLAYER, QUEUE, STATS, QR, SYS)

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
