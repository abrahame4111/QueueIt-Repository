# QueueIt - Product Requirements Document

## Overview
QueueIt is a smart music queueing system for venues (hostels, bars, cafes). Guests scan a QR code to request songs, admins control playback via Spotify. Full Cyberpunk 2077 aesthetic (yellow/black/neon-blue).

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
- **Fonts**: Orbitron (headings), JetBrains Mono (code), Rajdhani (body)
- **Colors**: #FCE300 (yellow), #00F0FF (cyan), #FF003C (accent), #0a0a0a (dark)

## Code Architecture
```
/app/backend/
  server.py, database.py, models.py, auth.py
  routes/: admin.py, queue.py, songs.py, spotify.py, analytics.py

/app/frontend/src/
  pages/: AdminDashboard.js, CustomerHome.js, DownloadPage.js, PostDownloadPage.js, StarterKit.js
  components/: AnalyticsDashboard.js, OnboardingTutorial.js, QRCodeGenerator.js, SpotifyPlayer.js
```

## Key DB Collections
- `queue`: Song queue items (status: queued/playing/played)
- `spotify_tokens`: OAuth tokens
- `settings`: Key-value settings (admin_password, venue_name)
- `analytics_log`: Permanent event log for analytics

## Completed Features (All Tested)
- Cyberpunk 2077 UI rebrand with custom Orbitron font and yellow/black/cyan palette
- New logo + icon redesign (yellow bg, dark bg, square icon, PWA icons, Electron icon)
- Song search via Spotify API
- Queue management (add, skip, remove, clear, play-next)
- Admin authentication (DB-backed, changeable password)
- Admin settings (venue name, Spotify connection, system info, replay tutorial)
- Interactive onboarding tutorial
- QR code generator
- PWA support (service worker v3 — network-first)
- Desktop Electron app with offline fallback
- Download proxy via GitHub Releases
- Auto-sync with native Spotify track changes
- Analytics Dashboard (stats, top songs, hourly/daily charts, recent activity)
- Starter Kit print materials (stickers, standing cards, A4 posters, tri-fold brochure)

## Backlog
- **P1**: Song voting/priority system
- **P2**: Multiple venue support, SEO meta tags
- **P3**: Advanced background animations (particles)
