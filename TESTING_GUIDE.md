# 🧪 Testing Guide - Hostel Music Queue System

## ✅ Current Configuration

**Frontend URL**: `http://127.0.0.1:3000` or `http://localhost:3000`
**Admin Dashboard**: `http://127.0.0.1:3000/admin`
**Backend API**: `http://localhost:8001/api`

**Spotify Redirect URI**: `http://127.0.0.1:3000/admin`

⚠️ **Important**: Make sure this EXACT redirect URI is added to your Spotify Dashboard:
```
http://127.0.0.1:3000/admin
```

---

## 📝 Complete Testing Steps

### Phase 1: Test Customer Portal (No Spotify Needed)

#### 1. Open Customer Portal
- URL: `http://127.0.0.1:3000/` or `http://localhost:3000/`
- You should see: "HOSTEL BEATS" header with neon design

#### 2. Test Song Search
- Click on **SEARCH** tab (should be active by default)
- Type: `believer` in the search box
- Click **SEARCH** button
- ✅ Expected: List of songs with "Believer" in the title
- Each song should have a **REQUEST** button

#### 3. Test Song Request
- Click **REQUEST** on any song
- ✅ Expected: Green toast notification "Song added to queue!"
- Click **QUEUE** tab
- ✅ Expected: Your requested song appears in the queue

#### 4. Test Playlists
- Click **PLAYLISTS** tab
- ✅ Expected: See "Party Songs 🥳 2010-2025 Hits 🎉" playlist
- Click on the playlist
- ✅ Expected: List of 50 party songs
- Click **REQUEST** on any song
- ✅ Expected: Toast notification appears

#### 5. Test Currently Playing
- After requesting songs, you should see a "NOW PLAYING" section at the top
- ✅ Expected: Shows first song requested with album art

---

### Phase 2: Test Admin Dashboard (Basic Features)

#### 1. Access Admin Dashboard
- URL: `http://127.0.0.1:3000/admin`
- ✅ Expected: See "ADMIN LOGIN" card

#### 2. Admin Login
- Password: `hostel2024`
- Click **LOGIN** button
- ✅ Expected: 
  - "Login successful" toast
  - Redirected to admin dashboard
  - See stats: "NOW PLAYING", "IN QUEUE", "TOTAL SONGS"

#### 3. View Queue
- Scroll down to **QUEUE** section
- ✅ Expected: See all songs you requested from customer portal
- Each song shows: position number, album art, title, artist, duration

#### 4. Test Skip Song
- Find the **NOW PLAYING** section
- Click **SKIP** button (neon cyan button on right)
- ✅ Expected: 
  - Current song marked as "played"
  - Next song becomes "NOW PLAYING"
  - Toast notification

#### 5. Test Remove Song
- In the QUEUE section, hover over any song
- Click the trash icon that appears
- ✅ Expected: Song removed from queue

#### 6. Test Clear Queue
- Click **CLEAR ALL** button (red button, top right of queue)
- Confirm the prompt
- ✅ Expected: All queued songs removed (not currently playing one)

#### 7. Test Logout
- Click **LOGOUT** button (top right)
- ✅ Expected: Redirected back to login page

---

### Phase 3: Test Spotify Integration (Requires Spotify Premium)

⚠️ **Prerequisites**:
- Spotify Premium account
- Redirect URI added to Spotify Dashboard: `http://127.0.0.1:3000/admin`

#### 1. Login to Admin
- Go to: `http://127.0.0.1:3000/admin`
- Login with: `hostel2024`

#### 2. Connect Spotify Account
- You should see **"Connect to Spotify"** card with music icon
- Click **"LOGIN WITH SPOTIFY"** button
- ✅ Expected: Redirected to Spotify authorization page

#### 3. Authorize App
- Login with your Spotify Premium account
- Review permissions requested
- Click **"Agree"** or **"Authorize"**
- ✅ Expected: Redirected back to `http://127.0.0.1:3000/admin`

#### 4. Verify Connection
- After redirect, you should see:
  - ✅ "Connected to Spotify!" toast notification
  - ✅ Spotify login card disappears
  - ✅ "Now Playing" card appears (if song in queue)

#### 5. Activate Spotify Device

**Option A: Using Laptop**
1. Open Spotify desktop app on your laptop
2. Play any song (you can pause it immediately)
3. Go back to admin dashboard
4. ✅ Device should show in "Playing on" section

**Option B: Using Bluetooth Speaker**
1. Connect Bluetooth speaker to your laptop
2. Open Spotify app
3. Click device icon in Spotify
4. Select your Bluetooth speaker
5. Play any song briefly
6. ✅ Speaker should show as active device

**Option C: Using Phone**
1. Open Spotify app on phone (same WiFi)
2. Play any song briefly
3. ✅ Phone should be detected as device

#### 6. Test Playback Control

**From Customer Portal**:
1. Open `http://127.0.0.1:3000/` in another tab
2. Search and request a song

**From Admin Dashboard**:
3. Go back to admin tab
4. ✅ Expected: Song starts playing on your Spotify device automatically!
5. Click **Play/Pause** button on the album art
6. ✅ Expected: Music pauses/resumes on your device

#### 7. Test Skip to Next Song
- Click **SKIP** button
- ✅ Expected: 
  - Current song stops
  - Next song in queue starts playing
  - Queue updates

---

## 🎯 Quick Workflow Test (End-to-End)

**Setup** (5 minutes):
1. Open admin dashboard: `http://127.0.0.1:3000/admin`
2. Login with: `hostel2024`
3. Click "LOGIN WITH SPOTIFY"
4. Authorize with Spotify Premium
5. Open Spotify app on laptop/phone
6. Play any song briefly

**Test Customer Experience**:
1. Open customer portal: `http://127.0.0.1:3000/`
2. Search for "uptown funk"
3. Click REQUEST on "Uptown Funk - Mark Ronson, Bruno Mars"
4. Search for "shape of you"
5. Click REQUEST on "Shape of You - Ed Sheeran"

**Verify Admin Experience**:
1. Go back to admin dashboard
2. ✅ Both songs should appear in queue
3. ✅ First song should start playing on Spotify device
4. ✅ When you click SKIP, second song should play

---

## ❌ Troubleshooting

### Issue: "INVALID_CLIENT: Invalid redirect URI"
**Cause**: Redirect URI not added to Spotify Dashboard

**Fix**:
1. Go to: https://developer.spotify.com/dashboard
2. Click your app → Settings
3. Add EXACTLY: `http://127.0.0.1:3000/admin`
4. Click Save
5. Clear browser cache
6. Try again

### Issue: "No active Spotify device found"
**Cause**: No Spotify app is open with your account

**Fix**:
1. Open Spotify desktop app OR mobile app
2. Make sure you're logged in with same account
3. Play any song briefly
4. Try requesting a song again

### Issue: Songs not playing
**Checklist**:
- ✅ Logged in with Spotify Premium? (Free won't work)
- ✅ Spotify app open on a device?
- ✅ Same Spotify account in app and admin?
- ✅ Device shows in admin dashboard?

### Issue: Can't access admin dashboard
**Try**:
- `http://127.0.0.1:3000/admin` 
- `http://localhost:3000/admin`
- Clear browser cache
- Try incognito/private window

### Issue: Backend errors
**Check logs**:
```bash
tail -f /var/log/supervisor/backend.err.log
```

---

## 🎥 Expected Behavior Summary

### Customer Portal
- ✅ Search works instantly
- ✅ Playlists load with album art
- ✅ REQUEST button adds to queue
- ✅ Toast notifications appear
- ✅ Queue updates in real-time
- ✅ Mobile-responsive design

### Admin Dashboard (Without Spotify)
- ✅ Login required
- ✅ Stats show correct numbers
- ✅ Queue displays all songs
- ✅ Skip moves to next song
- ✅ Clear queue works
- ✅ Remove individual songs works

### Admin Dashboard (With Spotify Connected)
- ✅ Shows "Now Playing" card with album art
- ✅ Play/Pause button controls actual Spotify
- ✅ Songs auto-play on active device
- ✅ Shows which device is playing
- ✅ Skip button advances to next track
- ✅ Real-time sync with queue

---

## 📊 Test Checklist

**Basic Functionality** (No Spotify Premium needed):
- [ ] Customer portal loads
- [ ] Song search works
- [ ] Playlists display
- [ ] Songs can be requested
- [ ] Queue updates
- [ ] Admin login works
- [ ] Admin can view queue
- [ ] Admin can skip songs
- [ ] Admin can clear queue

**Spotify Integration** (Spotify Premium required):
- [ ] Spotify login button appears
- [ ] OAuth redirect works
- [ ] Connection successful
- [ ] Device detected
- [ ] Songs play on device
- [ ] Play/pause controls work
- [ ] Skip advances playback
- [ ] Device info displays

---

## 🚀 Production Testing

For production deployment, update:

**Backend** (`/app/backend/.env`):
```env
SPOTIFY_REDIRECT_URI="https://your-domain.com/admin"
```

**Spotify Dashboard**:
Add: `https://your-domain.com/admin`

Then test using your actual domain URL!

---

**Need Help?** Check:
- `/app/SPOTIFY_SETUP.md` - Detailed Spotify setup
- `/app/QUICK_START.md` - Quick reference
- `/app/README.md` - Full documentation
