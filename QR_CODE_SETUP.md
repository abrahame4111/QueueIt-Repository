# QR Code Setup for Hostel Music Queue

## Overview
This document explains how to set up QR codes for your hostel music queueing system.

## What Customers Will See
When customers scan the QR code, they'll be taken to the customer portal where they can:
- Search for any song on Spotify
- Browse curated party playlists
- View the current queue
- Request songs that will play in order

## Setting Up QR Codes

### Step 1: Get Your App URL
Your customer portal URL is: `https://your-app-url.com/`

### Step 2: Generate QR Codes
You can use any free QR code generator:
- **QR Code Generator**: https://www.qr-code-generator.com/
- **QR Code Monkey**: https://www.qrcode-monkey.com/
- **Canva**: https://www.canva.com/qr-code-generator/

### Step 3: Create the QR Code
1. Go to any QR code generator
2. Enter your app URL: `https://your-app-url.com/`
3. Customize the design (optional):
   - Add your hostel logo in the center
   - Use neon cyan color (#00F0FF) to match the app theme
   - Add a border or frame
4. Download the QR code as PNG or SVG

### Step 4: Print and Display
Print the QR codes and place them:
- On each table in common areas
- At the bar counter
- Near the reception desk
- In the dining area
- On notice boards

### Recommended QR Code Design
```
╔══════════════════════════════════╗
║                                  ║
║         [QR CODE HERE]           ║
║                                  ║
║    🎵 QUEUE YOUR VIBE 🎵         ║
║                                  ║
║   Scan to request songs          ║
║                                  ║
╚══════════════════════════════════╝
```

## Admin Access
- Admin dashboard: `https://your-app-url.com/admin`
- Default password: `hostel2024`
- **Important**: Change the password in `/app/backend/.env` (ADMIN_PASSWORD)

## Admin Controls
From the admin dashboard you can:
- View currently playing song
- See the queue
- Skip the current song
- Clear the entire queue
- Remove individual songs

## Tips for Best Experience
1. **WiFi**: Ensure strong WiFi coverage where QR codes are placed
2. **Instructions**: Add a small note near QR codes: "Scan to request your favorite songs!"
3. **Monitor**: Check the admin dashboard periodically to manage the queue
4. **Backup**: Keep digital copies of QR codes for reprinting

## Troubleshooting
- If QR code doesn't scan: Ensure good lighting and hold phone steady
- If app doesn't load: Check internet connection
- If songs don't play: Verify Spotify credentials in backend

## Support
For technical issues or customization, refer to the main README.md file.
