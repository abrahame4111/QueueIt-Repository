# 🚀 Quick Start Guide - Hostel Music Queue

## 📋 Prerequisites Checklist
- [ ] Spotify Premium account
- [ ] Spotify Developer app created
- [ ] Client ID and Secret obtained

## ⚡ 5-Minute Setup

### 1️⃣ Configure Spotify App (2 minutes)
Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → Your App → Settings

**Add this Redirect URI:**
```
http://127.0.0.1:3000/admin
```
⚠️ **Important**: Use `127.0.0.1` NOT `localhost` (Spotify requirement)

Click **Save**

### 2️⃣ Test the Admin Dashboard (1 minute)
1. Open browser: `http://127.0.0.1:3000/admin`
2. Login with password: `hostel2024`
3. Click **"LOGIN WITH SPOTIFY"**
4. Authorize with your Spotify Premium account
5. You'll be redirected back

### 3️⃣ Activate Spotify Device (1 minute)
**Choose one option:**

**Option A: Laptop**
- Open Spotify app on your laptop
- Play any song (can pause immediately)
- Device is now active ✅

**Option B: Bluetooth Speaker**
- Connect speaker to laptop via Bluetooth
- Open Spotify app
- Select speaker as output device
- Play any song briefly
- Speaker is now active ✅

**Option C: Phone**
- Open Spotify app on phone (same WiFi)
- Play any song briefly
- Phone is now active ✅

### 4️⃣ Test the System (1 minute)
1. Open customer portal: `http://127.0.0.1:3000/`
2. Search for a song (e.g., "Believer")
3. Click **REQUEST** button
4. Go back to admin dashboard
5. Song should auto-play on your device! 🎵

## 🎯 Usage

### For Customers
1. Scan QR code → Opens customer portal
2. Search or browse playlists
3. Click REQUEST on desired song
4. Song added to queue

### For Admin (You)
1. Keep admin dashboard open on laptop
2. Monitor incoming song requests
3. Control playback:
   - Play/Pause button
   - Skip to next song
   - Clear queue
   - Remove individual songs

## 🔧 Troubleshooting

### ❌ "No active Spotify device found"
**Fix**: Open Spotify app and play any song briefly

### ❌ "Invalid redirect URI" error
**Fix**: Make sure you added `http://127.0.0.1:3000/admin` in Spotify Dashboard (not localhost)

### ❌ Song doesn't play
**Check**:
- ✅ Logged in with Spotify Premium?
- ✅ Spotify app open on a device?
- ✅ Device shows in admin dashboard?

### ❌ "Failed to connect to Spotify"
**Fix**: Clear browser cache and try logging in again

## 📱 Generate QR Codes

Use any QR generator with this URL:
```
http://your-actual-ip:3000/
```
Or for local testing:
```
http://127.0.0.1:3000/
```

Print QR codes and place them:
- On tables
- At the bar
- Near reception
- In common areas

## 🎨 Customization

### Change Admin Password
Edit `/app/backend/.env`:
```env
ADMIN_PASSWORD="your_new_password"
```
Restart backend: `sudo supervisorctl restart backend`

### Update Spotify Credentials
Edit `/app/backend/.env`:
```env
SPOTIFY_CLIENT_ID="your_client_id"
SPOTIFY_CLIENT_SECRET="your_client_secret"
```

## 📊 System Flow

```
Customer scans QR
    ↓
Opens portal on phone
    ↓
Searches/browses songs
    ↓
Requests a song
    ↓
Song added to MongoDB queue
    ↓
Admin dashboard detects new song
    ↓
Spotify API plays song on active device
    ↓
Song plays through laptop/speaker
    ↓
Admin can skip or let it finish
    ↓
Next song auto-plays (with manual skip)
```

## 🎵 Demo Workflow

**Morning Setup** (5 minutes):
1. Open laptop
2. Connect Bluetooth speaker
3. Login to admin dashboard: `http://127.0.0.1:3000/admin`
4. Click "LOGIN WITH SPOTIFY"
5. Open Spotify app and play a song briefly
6. Leave admin dashboard open

**Throughout the Day**:
- Customers request songs
- Songs auto-play on your speaker
- Monitor queue from dashboard
- Skip songs if needed

**Evening Shutdown**:
- Close admin dashboard
- Spotify device automatically disconnects

## 🆘 Need Help?

1. Check `/app/SPOTIFY_SETUP.md` for detailed setup
2. Check `/app/README.md` for API documentation
3. View logs: `tail -f /var/log/supervisor/backend.err.log`
4. Test backend: `curl http://localhost:8001/api/`

---

**Pro Tip**: Keep Spotify app running in background all day. Admin dashboard will control it remotely! 🎉
