# 🖥️ Desktop App Installation Guide

## Quick Start for Non-Technical Users

### What is This?

This is a **desktop application** for the Hostel Music Queue admin portal. Instead of opening a browser and typing the URL every time, you get a dedicated app that you can:

- Pin to your taskbar/dock
- Open with one click
- Keep always on top while doing other work
- Access without needing to remember the URL

---

## Installation Steps

### Option 1: Pre-Built Installer (Recommended)

**If someone has already built the app for you:**

#### Windows:
1. Double-click `Hostel Music Queue Admin Setup.exe`
2. Follow the installation wizard
3. Click "Install"
4. Done! Find the app in Start Menu

#### Mac:
1. Double-click `Hostel Music Queue Admin.dmg`
2. Drag the app to Applications folder
3. Open Applications → Hostel Music Queue Admin
4. If Mac says "unidentified developer", right-click → Open

#### Linux:
1. Double-click `Hostel Music Queue Admin.AppImage`
2. If asked, make it executable
3. Or from terminal: `chmod +x Hostel\ Music\ Queue\ Admin.AppImage`
4. Double-click to run

---

### Option 2: Build It Yourself

**If you need to build the app from source:**

#### Step 1: Install Node.js

**Windows/Mac:**
1. Go to https://nodejs.org/
2. Download the LTS version (recommended)
3. Run the installer
4. Click "Next" through all steps
5. Restart your computer

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm

# Arch
sudo pacman -S nodejs npm
```

#### Step 2: Download the App Files

If you have the `electron-app` folder, navigate to it in terminal/command prompt.

**Windows:**
1. Open File Explorer
2. Navigate to the `electron-app` folder
3. Click the address bar and type `cmd`
4. Press Enter (opens command prompt in that folder)

**Mac:**
1. Open Terminal
2. Type `cd ` (with a space)
3. Drag the electron-app folder onto Terminal
4. Press Enter

**Linux:**
1. Open Terminal
2. Navigate to: `cd /path/to/electron-app`

#### Step 3: Install Dependencies

In the terminal/command prompt, run:

```bash
npm install
```

Wait 1-3 minutes while it downloads packages.

You should see: ✅ "Done in X seconds"

#### Step 4: Test the App

```bash
npm start
```

The app should open! If it works, continue to build.

#### Step 5: Build the Installer

**For Windows:**
```bash
npm run build:win
```

**For Mac:**
```bash
npm run build:mac
```

**For Linux:**
```bash
npm run build:linux
```

Wait 2-5 minutes for the build to complete.

#### Step 6: Find Your Installer

Look in the `electron-app/dist/` folder:

**Windows:**
- `Hostel Music Queue Admin Setup.exe` (installer)
- `Hostel Music Queue Admin.exe` (portable - no installation)

**Mac:**
- `Hostel Music Queue Admin.dmg` (installer)
- `Hostel Music Queue Admin-mac.zip` (portable)

**Linux:**
- `Hostel Music Queue Admin.AppImage` (portable)
- `hostel-music-queue-admin.deb` (Debian/Ubuntu installer)

#### Step 7: Install

Double-click your installer and follow the prompts!

---

## Using the App

### First Time Setup

1. **Open the app**
2. **Login** with admin password: `hostel2024`
3. **Connect Spotify** (will open in your browser)
4. **Login to Spotify** with your Premium account
5. **Approve** the permissions
6. **Done!** You're now controlling music from the desktop app

### Daily Use

**Opening the App:**
- Windows: Click from Start Menu or taskbar
- Mac: Click from Applications or Dock
- Linux: Click from App Launcher

**Pinning for Quick Access:**

**Windows:**
1. Open the app
2. Right-click the taskbar icon
3. Click "Pin to taskbar"

**Mac:**
1. Open the app
2. Right-click the Dock icon
3. Options → Keep in Dock

**Linux (varies by desktop):**
- Usually right-click and add to favorites/dock

### Useful Features

**Always on Top:**
1. Click "Window" menu
2. Check "Always on Top"
3. Now the app stays visible even when clicking other windows

**Keyboard Shortcuts:**
- `Ctrl+R` (Cmd+R on Mac) - Reload
- `Ctrl+Q` (Cmd+Q on Mac) - Quit
- `Ctrl++` (Cmd++ on Mac) - Zoom in
- `Ctrl+-` (Cmd+- on Mac) - Zoom out
- `F11` - Fullscreen

**Opening Customer Portal:**
1. Click "Help" menu
2. Click "Open Customer Portal in Browser"
3. Browser opens to customer URL (for testing)

---

## Troubleshooting

### Windows: "Windows protected your PC"

This appears because the app isn't signed with a Microsoft certificate (costs $$$).

**Solution:**
1. Click "More info"
2. Click "Run anyway"
3. The app is safe - it's just not commercially signed

### Mac: "App can't be opened because it's from an unidentified developer"

macOS Gatekeeper blocks unsigned apps.

**Solution:**
1. Right-click the app
2. Click "Open"
3. Click "Open" in the dialog
4. Or: System Preferences → Security → "Open Anyway"

### Linux: AppImage won't run

**Solution:**
```bash
# Make it executable
chmod +x Hostel\ Music\ Queue\ Admin.AppImage

# Run it
./Hostel\ Music\ Queue\ Admin.AppImage
```

### App Opens But Shows Blank Screen

**Possible causes:**
1. No internet connection
2. Admin portal URL is down

**Solution:**
1. Check internet connection
2. Try opening https://queueit.preview.emergentagent.com/admin in browser
3. If browser works, press Ctrl+Shift+R in app to force reload

### Spotify Login Opens Inside App (Wrong!)

It should open in your system browser.

**If it doesn't:**
1. Click the Spotify link
2. Copy the URL
3. Paste in your actual browser
4. Complete login there

### Build Fails with "electron-builder not found"

**Solution:**
```bash
# Delete node_modules
rm -rf node_modules

# Reinstall
npm install

# Try again
npm run build:win
```

---

## File Sizes

After building:

- **Windows installer**: ~130-150 MB
- **Mac DMG**: ~140-160 MB  
- **Linux AppImage**: ~130-150 MB

The app is large because it includes a full browser engine (Chromium).

---

## Updating the App

### When a new version is released:

1. **Uninstall** old version (optional - installer may overwrite)
2. **Download** new installer
3. **Install** new version
4. **Your login** and settings are preserved

---

## Advanced: Customization

### Change the Admin URL

If your admin portal is at a different URL:

1. Open `main.js` in a text editor
2. Find line 5: `const ADMIN_URL = '...'`
3. Change to your URL
4. Save
5. Rebuild: `npm run build:win`

### Change the App Icon

1. Replace `assets/icon.png` with your logo
2. Icon should be 512x512 pixels
3. Rebuild the app
4. New icon will appear

---

## For IT Administrators

### Mass Deployment

**Windows:**
```bash
# Build silent installer
npm run build:win

# Deploy via GPO or SCCM
# Use /S flag for silent install
"Hostel Music Queue Admin Setup.exe" /S
```

**Mac:**
```bash
# Build DMG
npm run build:mac

# Deploy via MDM (Jamf, Intune, etc.)
# Copy to /Applications folder
```

**Linux:**
```bash
# Build DEB package
npm run build:linux

# Deploy via package manager
sudo dpkg -i hostel-music-queue-admin.deb
```

### Network Installation

If building on one computer and deploying to many:

1. Build once: `npm run build:all`
2. Copy installers from `dist/` folder
3. Distribute via network share or USB
4. Users run installer on their machine

---

## FAQ

**Q: Do I need to install this on every computer?**
A: Yes, each computer that needs the admin app must install it.

**Q: Can I use this on a Chromebook?**
A: No, Electron apps don't run on ChromeOS. Use the browser version.

**Q: Does this work offline?**
A: No, it needs internet to connect to the admin portal and Spotify.

**Q: Can I have multiple admins?**
A: Yes, install the app on multiple computers. Each admin logs in separately.

**Q: How do I uninstall?**
- Windows: Settings → Apps → Uninstall
- Mac: Drag from Applications to Trash
- Linux: `sudo apt remove hostel-music-queue-admin` or delete AppImage

**Q: Is my password saved?**
A: Yes, in encrypted browser storage (same as Chrome/Firefox).

---

## Support

**Need help?**

1. Check this guide first
2. Try the troubleshooting section
3. Check if the web version works: https://queueit.preview.emergentagent.com/admin
4. If web version works but app doesn't, it's an app issue

**Common fixes that solve 90% of issues:**
- Restart the app
- Restart your computer
- Press Ctrl+Shift+R to force reload
- Check internet connection

---

## System Requirements

**Minimum:**
- **OS**: Windows 10/11, macOS 10.13+, or Linux (Ubuntu 18.04+)
- **RAM**: 2 GB
- **Disk**: 200 MB free
- **Internet**: Required (always)

**Recommended:**
- **RAM**: 4 GB or more
- **CPU**: Dual-core processor
- **Internet**: Stable connection (Wi-Fi or Ethernet)

---

**Made with Emergent** 🚀

This desktop app wraps the web admin portal in a native application for easier access and better user experience.
