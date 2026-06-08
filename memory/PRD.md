# QueueIt - Product Requirements Document

## Overview
QueueIt is a smart music queueing system for venues (hostels, bars, cafes, restaurants, clubs). Guests scan a QR code to request songs, admins control playback via Spotify. Full Cyberpunk 2077 aesthetic (yellow/black/neon-blue).

## Tech Stack
- **Frontend**: React, TailwindCSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI (modular routes), Motor (async MongoDB)
- **Database**: MongoDB
- **API**: Spotify Web API (OAuth 2.0 + Client Credentials)
- **Desktop**: Electron.js (one-click NSIS installer with branded splash)
- **Mobile**: PWA (Service Workers v4)
- **Fonts**: Orbitron (headings), JetBrains Mono (code), Rajdhani (body)
- **Colors**: #FCE300 (yellow), #00F0FF (cyan), #FF003C (accent), #0a0a0a (dark)

## Code Architecture
```
/app/backend/routes/
  admin.py       # Login, settings, password reset, download proxy
  queue.py       # Queue CRUD + cleanup + analytics logging
  songs.py       # Spotify search (with genre filter support)
  spotify.py     # OAuth, playback, devices
  analytics.py   # Analytics endpoints + event logging
  filters.py     # Venue filter presets, mode toggle, genre/mood management

/app/frontend/src/
  pages/: AdminDashboard, CustomerHome, DownloadPage, PostDownloadPage, StarterKit
  components/: AnalyticsDashboard, VenueFilters, LogoBanner, OnboardingTutorial, QRCodeGenerator, SpotifyPlayer
```

## Key DB Collections
- `queue`: Song queue items
- `spotify_tokens`: OAuth tokens
- `settings`: Key-value settings (admin_password, venue_name)
- `analytics_log`: Permanent event log
- `venue_filters`: Active filter config (mode, preset, genres, moods, energy)

## Completed Features
- Cyberpunk 2077 UI with Orbitron font and yellow/black/cyan palette
- New logo/icon redesign (yellow bg Q icon, LogoBanner React component)
- Song search via Spotify API with genre filtering
- Queue management (add, skip, remove, clear, play-next)
- Admin auth (DB-backed, changeable, resettable)
- Admin settings (venue name, Spotify, system info, replay tutorial)
- Interactive onboarding tutorial
- QR code generator
- PWA support (service worker v4)
- Desktop Electron app (one-click installer, branded splash screen)
- Download proxy via GitHub Releases
- Auto-sync with native Spotify track changes
- Analytics Dashboard (stats, top songs, hourly/daily charts, recent activity)
- Starter Kit (stickers, standing cards, A4 posters, tri-fold brochure with download buttons)
- **Venue Filters**: 5 presets (Fine Dining, Club, Cafe, Bar, Open), strict/open mode, genre/mood chips, customer-facing filter bar

## Backlog
- **P1**: Song voting/priority system
- **P2**: Multiple venue support, SEO meta tags
- **P3**: Advanced background animations
