# 🔄 Switching Spotify Accounts - Complete Guide

## Problem Statement
After logging into the admin console with one Spotify account, you need to allow your **client** to login with **their** Spotify account for playback control.

## Solution: Complete Account Switch Process

### Step-by-Step Instructions

#### Step 1: Logout from Admin Console
1. In the admin dashboard, click the **LOGOUT** button (top right corner)
2. This will:
   - Clear Spotify tokens from the database
   - Clear your admin session
   - Redirect you to the login page
3. ✅ You'll see: "Logged out from Spotify - You will need to re-authorize"

#### Step 2: Logout from Spotify.com (CRITICAL)
**This is the key step most people miss!**

Before your client can login, you must logout from Spotify in the browser:

**Option A: Logout from Spotify Website**
1. Open a new tab and go to: https://www.spotify.com
2. Click your profile icon (top right)
3. Click "Log out"
4. ✅ This ensures your Spotify session is completely cleared

**Option B: Use Private/Incognito Mode** (Recommended)
1. Close the admin console tab
2. Open a new **Incognito/Private window**
3. Go to the admin console URL
4. Login as admin
5. ✅ This ensures no Spotify cookies interfere

**Option C: Clear Browser Cookies** (Most Thorough)
1. Go to browser settings → Privacy & Security → Cookies
2. Search for "spotify.com" and "accounts.spotify.com"
3. Delete all Spotify cookies
4. Refresh the admin console
5. ✅ Complete clean slate

#### Step 3: Your Client Logs into Admin
1. Your client opens the admin console
2. Enters the admin password: `hostel2024`
3. ✅ They see the admin dashboard

#### Step 4: Your Client Connects Their Spotify
1. They click **"LOGIN WITH SPOTIFY"** button
2. Spotify's login page appears
3. **Important**: They enter **their own** Spotify credentials
4. After login, they see the consent screen
5. They click **"Agree"** to authorize
6. ✅ Now their Spotify Premium account is connected!

### Why Both Logouts Are Needed

| Logout Action | What It Clears |
|---------------|----------------|
| Admin Console Logout | Database tokens, admin session |
| Spotify.com Logout | Browser cookies, Spotify session |

**Without Spotify.com logout**: The browser remembers your Spotify login, and clicking "LOGIN WITH SPOTIFY" will automatically reconnect **your** account instead of showing the login screen for your client.

## Quick Workflow for Daily Use

### Morning: Hostel Manager (Your Account)
```
1. Login to admin → hostel2024
2. Connect your Spotify
3. Manage queue during morning shift
4. LOGOUT from admin console
5. LOGOUT from spotify.com
```

### Afternoon: Client Takes Over (Their Account)
```
1. Open admin in INCOGNITO mode (recommended)
2. Login to admin → hostel2024
3. Click "LOGIN WITH SPOTIFY"
4. Enter THEIR Spotify credentials
5. Agree to terms
6. ✅ Their Spotify is now controlling playback
```

### Evening: Back to You
```
1. Tell client to LOGOUT from admin
2. They logout from spotify.com
3. You open admin (new incognito)
4. Login and connect YOUR Spotify again
```

## Troubleshooting

### Problem: "LOGIN WITH SPOTIFY" auto-connects to wrong account
**Solution**: 
1. Logout from admin console
2. **Logout from spotify.com** (the step you probably missed)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try again in incognito mode

### Problem: Client sees "Already connected" but it's your account
**Solution**:
1. Go to https://www.spotify.com/account/apps/
2. Find "Hostel Music Queue" app
3. Click "REMOVE ACCESS"
4. Logout from spotify.com
5. Logout from admin console
6. Start fresh in incognito mode

### Problem: Authorization screen doesn't show login form
**Solution**:
1. This means browser has cached Spotify login
2. Open: https://accounts.spotify.com
3. Logout from there explicitly
4. Or use incognito mode

## Best Practice for Production

### Recommended Setup
1. **Use separate browser profiles** for each admin
   - Chrome: Click profile icon → "Add profile"
   - Each admin has their own browser profile
   - Spotify cookies stay isolated

2. **Use different devices**
   - Manager uses their laptop
   - Client uses the hostel's dedicated device
   - No account mixing issues

3. **Use incognito mode always**
   - Train all admins to use incognito
   - Forces fresh login every time
   - No cookie conflicts

### For Hostel Staff Training
Print this checklist:

```
☐ Step 1: Admin console logout (click LOGOUT button)
☐ Step 2: Spotify.com logout (go to spotify.com → profile → logout)
☐ Step 3: Open NEW INCOGNITO window
☐ Step 4: Next person logs in with THEIR credentials
☐ Step 5: Connect THEIR Spotify account
```

## Technical Explanation

### Why show_dialog=true Isn't Enough
- `show_dialog=true` shows the **consent screen**
- But if you're already logged into Spotify in browser, it auto-approves
- The consent screen shows, but with YOUR account name
- It doesn't prompt for **login credentials**

### Spotify OAuth Flow
```
User clicks "LOGIN WITH SPOTIFY"
  ↓
Redirect to accounts.spotify.com
  ↓
Browser checks: "Am I logged into Spotify?"
  ↓
YES → Show consent with current account
NO → Show login form
  ↓
After consent/login → Redirect back to app
```

### Our Implementation
```python
# Backend: server.py
auth_url = f"https://accounts.spotify.com/authorize?" + \
    f"client_id={spotify_client_id}&" + \
    f"response_type=code&" + \
    f"redirect_uri={redirect_uri}&" + \
    f"scope={scope}&" + \
    f"show_dialog=true"  # Forces consent screen
```

The `show_dialog=true` ensures you see the "Agree" screen every time, but **browser cookies** determine which account appears.

## Summary

✅ **Admin Console Logout** = Clears our database  
✅ **Spotify.com Logout** = Clears browser cookies  
✅ **Incognito Mode** = Fresh start every time  

**Do all three** for guaranteed account switching!

---

**Made with Emergent** 🚀
