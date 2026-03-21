# 🎵 Hostel Music Queue - Admin Desktop App

## Overview

This is the **Electron desktop application** for the Hostel Music Queue admin portal. It provides a dedicated, always-accessible desktop app for managing your hostel's music queue.

## Features

✅ **Standalone Desktop App** - No browser needed
✅ **Always Accessible** - Pin to taskbar/dock for instant access
✅ **Always on Top** - Optional setting to keep admin visible
✅ **Keyboard Shortcuts** - Quick access to common functions
✅ **Auto-Updates** - Easy refresh and reload
✅ **Spotify Integration** - Opens OAuth in system browser
✅ **Cross-Platform** - Works on Windows, Mac, and Linux

---

## Installation

### Prerequisites

You need **Node.js** installed on your system.

**Download Node.js**: https://nodejs.org/ (LTS version recommended)

### Step 1: Install Dependencies

Open terminal/command prompt in this folder and run:

```bash
npm install
```

or if you have yarn:

```bash
yarn install
```

This will install Electron and build tools.

---

## Running the App

### Development Mode

To run the app in development mode:

```bash
npm start
```

or

```bash
yarn start
```

This will open the admin portal in an Electron window.

---

## Building the App

### Build for Your Platform

**Windows**:
```bash
npm run build:win
```

Creates:
- `dist/Hostel Music Queue Admin Setup.exe` (installer)
- `dist/Hostel Music Queue Admin.exe` (portable)

**Mac**:
```bash
npm run build:mac
```

Creates:
- `dist/Hostel Music Queue Admin.dmg` (installer)
- `dist/Hostel Music Queue Admin-mac.zip` (portable)

**Linux**:
```bash
npm run build:linux
```

Creates:
- `dist/Hostel Music Queue Admin.AppImage` (portable)
- `dist/hostel-music-queue-admin.deb` (Debian/Ubuntu installer)

### Build for All Platforms

```bash
npm run build:all
```

Builds installers for Windows, Mac, and Linux.

**Note**: Building for Mac requires macOS. Building for Windows works on Windows or Linux.

---

## Distribution

### For Hostel Staff

1. **Build the app** for your platform
2. **Copy the installer** from `dist/` folder
3. **Send to hostel** via email/USB/cloud storage
4. **Install on admin computer**
5. **Pin to taskbar** for easy access

### Portable Version

The portable versions (`.exe` on Windows, `.AppImage` on Linux) don't require installation.

**Usage**:
1. Copy portable file to desktop
2. Double-click to run
3. No installation needed!

---

## App Usage

### First Launch

1. Open the app
2. You'll see the admin login screen
3. Enter password: `hostel2024`
4. Connect your Spotify Premium account
5. Start managing the queue!

### Keyboard Shortcuts

- **Ctrl/Cmd + R** - Reload app
- **Ctrl/Cmd + Shift + R** - Force reload (clear cache)
- **Ctrl/Cmd + Q** - Quit app
- **Ctrl/Cmd + Plus** - Zoom in
- **Ctrl/Cmd + Minus** - Zoom out
- **Ctrl/Cmd + 0** - Reset zoom
- **Ctrl/Cmd + Shift + I** - Open Developer Tools
- **F11** - Toggle fullscreen

### Menu Features

**File Menu**:
- Reload - Refresh the app
- Force Reload - Clear cache and reload
- Quit - Close the app

**View Menu**:
- Zoom controls
- Fullscreen toggle
- Developer tools

**Window Menu**:
- Minimize/Maximize
- **Always on Top** - Keep admin visible while using other apps

**Help Menu**:
- Open admin portal in browser
- Open customer portal in browser
- About app info

---

## Customization

### Change Admin URL

Edit `main.js` line 5:

```javascript
const ADMIN_URL = 'https://your-custom-domain.com/admin';
```

Then rebuild the app.

### Change App Icon

1. Replace `assets/icon.png` with your logo (512x512px recommended)
2. Rebuild the app
3. The new icon will appear in taskbar and title bar

### Change App Name

Edit `package.json`:

```json
{
  "name": "your-app-name",
  "productName": "Your App Display Name"
}
```

---

## Troubleshooting

### App Won't Start

**Solution**:
1. Delete `node_modules` folder
2. Run `npm install` again
3. Try `npm start`

### Build Fails

**Solution**:
1. Ensure Node.js is up to date
2. Check internet connection
3. Clear npm cache: `npm cache clean --force`
4. Try again: `npm run build:win`

### Spotify Login Opens in App (Instead of Browser)

**Solution**:
This is handled automatically. Spotify OAuth should open in your system browser, not inside the app.

### App Appears Blank

**Solution**:
1. Check internet connection
2. Press Ctrl/Cmd + Shift + R to force reload
3. Check if admin portal URL is accessible in browser

---

## File Structure

```
electron-app/
├── package.json       # App configuration and dependencies
├── main.js           # Main Electron process
├── preload.js        # Security preload script
├── assets/           # App icons and images
│   └── icon.png      # App icon (512x512px)
├── dist/             # Built installers (after build)
└── README.md         # This file
```

---

## Security

✅ **Context Isolation** - Renderer process is isolated
✅ **No Node Integration** - Web content can't access Node.js
✅ **Web Security** - Same-origin policy enforced
✅ **External Links** - Open in system browser, not in-app

The app is configured with security best practices.

---

## Updates

### Updating the App

To update to a new version:

1. Download new version
2. Uninstall old version (or overwrite)
3. Install new version
4. Your login will persist (stored in browser cookies)

### Auto-Update (Future)

Auto-update functionality can be added using `electron-updater`.

---

## Development

### Tech Stack

- **Electron** - Desktop app framework
- **Node.js** - JavaScript runtime
- **electron-builder** - Build and package tool

### Development Workflow

1. Edit `main.js` for app behavior
2. Run `npm start` to test
3. Build with `npm run build:win` (or your platform)
4. Test the built installer
5. Distribute to users

---

## Support

### Common Issues

**Q: How do I update the admin password?**
A: Password is set on the backend server, not in this app.

**Q: Can I run this on Raspberry Pi?**
A: Yes! Build for Linux ARM: `npm run build:linux -- --arm64`

**Q: Can multiple admins use the app?**
A: Yes, but they need separate devices or user accounts on the same computer.

**Q: Does this work offline?**
A: No, it requires internet to connect to the admin portal and Spotify.

---

## License

MIT License - Free to use and modify

---

## Made with Emergent 🚀

Powered by Emergent AI Agent
