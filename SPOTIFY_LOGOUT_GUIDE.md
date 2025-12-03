# 🎵 Spotify Logout & Re-authentication Guide

## How Spotify Logout Works

When you click **LOGOUT** from the admin console, the system performs the following actions:

### 1. Spotify Token Deletion
- **Backend Action**: Deletes all Spotify OAuth tokens from MongoDB database
- **Endpoint**: `POST /api/spotify/logout`
- **Effect**: Removes access tokens, refresh tokens, and expiry data

### 2. Local State Clearance
- Clears admin authentication token from browser localStorage
- Resets all React state (admin session + Spotify connection)
- Redirects to login page

### 3. Force Re-authentication on Next Login
- Spotify auth URL includes `show_dialog=true` parameter
- This forces Spotify to show the authorization screen
- Users will see:
  - Spotify account selection (if multiple accounts)
  - Permission scopes review
  - "Agree" button to authorize

## Expected Behavior

### Scenario 1: Logout and Login with Same Account
1. Click LOGOUT → Tokens deleted from database
2. Login to admin again → See "LOGIN WITH SPOTIFY" button
3. Click "LOGIN WITH SPOTIFY" → **Spotify shows consent screen**
4. Agree and authorize → Connected with same account

### Scenario 2: Logout and Login with Different Account
1. Click LOGOUT → Tokens deleted from database
2. Login to admin again → See "LOGIN WITH SPOTIFY" button
3. Click "LOGIN WITH SPOTIFY" → **Spotify shows consent screen**
4. Can select different Spotify account
5. Agree and authorize → Connected with new account

## Important Notes

### Spotify OAuth Limitations
- Spotify does **not** provide a token revocation API endpoint
- Tokens expire automatically after 1 hour
- We use `show_dialog=true` to force re-authentication UI

### Browser Cache Behavior
If Spotify still auto-connects after logout:
1. Clear browser cookies for `accounts.spotify.com`
2. Or use browser's private/incognito mode
3. Spotify's OAuth cookies may persist across sessions

### Production Recommendations
For strict security in production:
1. Instruct users to fully logout from Spotify web player
2. Use private browsing for testing different accounts
3. Consider implementing IP-based session management
4. Add warning message about clearing browser cookies

## Testing Logout

To verify logout works correctly:

```bash
# 1. Check tokens before logout
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:8001/api/spotify/token

# 2. Perform logout
curl -X POST \
  -H "Authorization: Bearer <admin_token>" \
  http://localhost:8001/api/spotify/logout

# 3. Check tokens after logout (should return no token)
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:8001/api/spotify/token
```

## User Instructions

**For Hostel Staff:**
1. When changing shifts, always click LOGOUT
2. This ensures the next admin must connect their own Spotify
3. Each admin's Spotify Premium account will be used for playback
4. If prompted, agree to Spotify terms to enable playback control

**For Switching Spotify Accounts:**
1. LOGOUT from admin console
2. Clear browser cookies (optional but recommended)
3. LOGIN to admin again
4. Click "LOGIN WITH SPOTIFY"
5. On Spotify's screen, select different account
6. Agree to terms
7. Your new account is now connected

## Security Features

✅ **Tokens deleted from database** - Cannot be recovered
✅ **show_dialog=true enforced** - Always shows consent screen
✅ **Scope validation** - Only necessary permissions requested
✅ **Automatic token expiry** - Tokens expire in 1 hour
✅ **Local storage cleared** - No residual session data

## Troubleshooting

**Problem**: Spotify auto-connects after logout
**Solution**: 
- Clear browser cookies for `spotify.com` and `accounts.spotify.com`
- Use private/incognito browsing mode
- Wait for token expiry (1 hour)

**Problem**: "LOGIN WITH SPOTIFY" button doesn't appear
**Solution**:
- Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
- Check backend logs for token deletion confirmation
- Verify MongoDB has no tokens: `db.spotify_tokens.find()`

**Problem**: Different account doesn't show up in Spotify auth
**Solution**:
- Logout from Spotify web player completely
- Clear ALL Spotify cookies from browser
- Try in incognito/private mode

---

**Made with Emergent** 🚀
