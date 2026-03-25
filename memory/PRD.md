# QueueIt - Product Requirements Document

## Problem Statement
Build a music queueing system called "QueueIt" for hostels, bars, and cafés. Customers scan a QR code to request songs, admins control the queue and Spotify playback from a dashboard. The project has evolved into a full product launch with a marketing website, desktop app (Electron/PWA), onboarding tutorial, and QR code generator.

## User Personas
- **Admin (Venue Owner/Staff)**: Manages the music queue, controls Spotify playback, generates QR codes for venue display
- **Customer (Guest)**: Scans QR code to search and request songs from their phone

## Core Requirements
1. Spotify integration for song search and playback control
2. Real-time music queue management (add, skip, remove, clear)
3. Admin authentication with password protection
4. Customer-facing song request portal (mobile-optimized)
5. Marketing/download website
6. In-app QR code generator
7. First-launch onboarding tutorial
8. PWA support for installability

## Architecture
- **Frontend**: React 19 + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI + Motor (MongoDB async driver)
- **Database**: MongoDB
- **API Integration**: Spotify Web API (OAuth 2.0)
- **Desktop**: Electron.js (scaffolded), PWA (implemented)

## Key API Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/queue` - Get all songs in queue
- `GET /api/queue/current` - Get currently playing song
- `POST /api/queue/add` - Add song to queue
- `POST /api/queue/skip` - Skip current song (admin)
- `POST /api/queue/clear` - Clear queue (admin)
- `DELETE /api/queue/{id}` - Remove specific song (admin)
- `GET /api/songs/search?q=` - Search Spotify
- `GET /api/songs/playlists` - Get featured playlists
- `GET /api/spotify/auth-url` - Get Spotify OAuth URL
- `POST /api/spotify/callback` - Handle OAuth callback
- `POST /api/spotify/logout` - Disconnect Spotify
- `GET /api/spotify/token` - Check token status
- `GET /api/spotify/devices` - List Spotify devices
- `POST /api/spotify/play` - Play track
- `POST /api/spotify/pause` - Pause playback
- `POST /api/spotify/resume` - Resume playback
- `GET /api/spotify/playback-state` - Get playback state
- `GET /api/download` - Marketing website

## DB Schema
- **queue**: `{ id, song: {id, name, artist, album, duration_ms, album_art, spotify_uri}, requested_by, requested_at, status }`
- **spotify_tokens**: `{ admin_token, access_token, refresh_token, expires_at, updated_at }`

---

## What's Been Implemented

### Phase 1: Core Application (COMPLETE)
- [x] Spotify search and song queueing
- [x] Admin dashboard with queue management
- [x] Customer portal with search, playlists, queue tabs
- [x] Spotify OAuth and playback control
- [x] Real-time queue polling
- [x] Mobile-responsive UI
- [x] Spotify logout and account switching
- [x] Playback auto-advance
- [x] Password-protected admin access

### Phase 1.5: Marketing Website (COMPLETE - March 2026)
- [x] Static marketing website at `/api/download`
- [x] Google Chrome-inspired clean design
- [x] OS-detecting download button
- [x] Features, How It Works, and Download sections
- [x] Responsive design

### Phase 2: In-App Features (COMPLETE - March 2026)
- [x] QR Code Generator in admin dashboard
  - Download PNG, Print, Copy Link
  - Venue name customization
  - Points to customer portal URL
- [x] First-launch onboarding tutorial (5 steps)
  - Welcome → Connect Spotify → Generate QR → Manage Queue → All Set
  - Skip option, progress indicators
  - localStorage persistence
- [x] PWA support (manifest.json, service worker, icons)

### Phase 2.5: Mobile Admin Console (COMPLETE - March 2026)
- [x] Fully responsive mobile layout with bottom tab navigation
  - Player tab: mini stats, Spotify player, Skip/Clear actions
  - Queue tab: touch-friendly queue list with swipe-to-delete
  - QR Code tab: full QR generator on mobile
  - Settings tab: Spotify connect/disconnect/switch, app info, logout
- [x] Sticky header with QueueIt branding and Spotify connection status
- [x] PWA installable on iOS/Android ("Add to Home Screen")
- [x] Safe area support for notched devices
- [x] Desktop layout preserved unchanged (md+ breakpoint)

### Phase 3: Cyberpunk 2077 Rebrand (COMPLETE - March 2026)
- [x] Complete UI rebrand to Cyberpunk 2077 aesthetic
  - Color palette: Primary Yellow (#FCEE0A), Cyan (#00F0FF), Accent Red (#FF003C), Black (#050505)
  - Fonts: Unbounded (headings), JetBrains Mono (mono/labels), IBM Plex Sans (body)
  - Effects: Glitch text, scanline overlays, HUD corner marks, breathing borders
  - Angular clip-path buttons, glass-morphism panels
  - Framer-motion tab transitions with AnimatePresence
- [x] Custom cyberpunk logo and app icons generated
- [x] Admin login redesigned as "Access Terminal"
- [x] Admin dashboard: cyber-cards, neon borders, PURGE/NEXT buttons
- [x] Customer portal: glitch hero text, cyberpunk search/browse/queue
- [x] Download/marketing website: full cyberpunk landing page with glitch effects
- [x] QR code generator: cyan QR on black background
- [x] Onboarding tutorial: cyberpunk step cards with motion animations
- [x] All mobile layouts updated with cyberpunk styling

---

## Backlog / Remaining Tasks

### P0 - High Priority
- Spotify OAuth flow testing (user reported client_id/redirect_uri issues — credentials updated)

### P1 - Medium Priority
- Enhanced onboarding with interactive tutorial (highlight actual UI elements)
- Admin settings page (change password, manage venue info)

### P2 - Nice to Have
- Refactor `server.py` into modular route files
- Extract AdminDashboard state logic into custom hooks
- Analytics dashboard (most requested songs, peak hours)
- Multiple venue support
- Song voting/priority system

---

## Changelog

### March 25, 2026
- **Fixed**: Spotify song search `400 Invalid limit` error — Spotify dev mode restricts search to max 10 items; changed `limit=20` to `limit=10` in `server.py`
- **Removed**: Obsolete `/app/download-website/` directory and its `StaticFiles` mount + `/api/download` route from `server.py`
- **Cleaned**: Removed unused `StaticFiles` import from `server.py`
- **Added**: Mac DMG installer linked to landing page download button (Universal build for Intel & Apple Silicon)
