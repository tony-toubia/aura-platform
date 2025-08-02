# OAuth Connection Debug Checklist

## 🔍 Step-by-Step Debugging Process

### 1. Database Verification
Run `verify-migration.sql` in Supabase and confirm:
- [ ] `aura_id` column exists in `oauth_connections` table
- [ ] You have at least one aura in the `auras` table
- [ ] The `oauth_connections` table is currently empty

### 2. Environment Variables Check
Verify in your `.env.local`:
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] Restart your dev server after any env changes

### 3. Browser Console Test
1. Open your app and navigate to edit an aura
2. Open browser DevTools (F12) → Console tab
3. Click on "Fitness" sense → Try to connect Google Fit
4. Look for these console messages **in order**:

```
🎯 handleConnect called: {providerId: "google_fit", senseType: "fitness", auraId: "...", timestamp: "..."}
🔑 Environment check: {hasGoogleFitClientId: false, hasGoogleClientId: true, clientId: "205298800..."}
🚀 Starting Google Fit OAuth flow...
```

**If you don't see these messages:**
- [ ] Check for JavaScript errors in console (red text)
- [ ] Verify the fitness sense is properly configured
- [ ] Check if the OAuth modal is opening

**If OAuth popup opens but fails:**
- [ ] Check if popup is blocked by browser
- [ ] Look for OAuth error messages in popup window
- [ ] Check Network tab for failed requests to Google

**If OAuth completes successfully, look for:**
```
🎉 Google Fit OAuth completed: {hasAccessToken: true, hasRefreshToken: true, ...}
📞 Calling onConnectionComplete with: {providerId: "google_fit", ...}
🔗 handleOAuthConnection called: {senseId: "fitness", providerId: "google_fit", ...}
📤 Making API request to save OAuth connection: {...}
```

### 4. Server Logs Check
In your terminal where the dev server is running, look for:
```
🚀 POST /api/oauth-connections called with: {provider: "google_fit", sense_type: "fitness", ...}
🔐 Authentication check: {hasUser: true, userId: "...", authError: null}
💾 Inserting OAuth connection: {...}
✅ Successfully created OAuth connection with ID: ...
```

**If you don't see server logs:**
- [ ] The API request isn't being made (check browser Network tab)
- [ ] Check if there are any network errors

**If you see authentication errors:**
- [ ] Log out and log back in
- [ ] Check if your session is valid

**If you see database insertion errors:**
- [ ] Check the error message for clues
- [ ] Verify the database migration was applied correctly

### 5. Database Verification After Test
After attempting to connect, run this SQL:
```sql
SELECT * FROM public.oauth_connections ORDER BY created_at DESC LIMIT 5;
```

**Expected result:**
- [ ] New row with your connection data
- [ ] `aura_id` field populated with the correct aura ID
- [ ] `provider` = 'google_fit'
- [ ] `sense_type` = 'fitness'

### 6. UI State Check
After successful connection:
- [ ] The Google Fit provider should show "Connected" status
- [ ] Connection should persist when you refresh the page
- [ ] Connection should appear when you edit the same aura again

## 🚨 Common Issues and Solutions

### Issue: "Google Client ID not configured"
**Solution:** Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local` and restart server

### Issue: OAuth popup blocked
**Solution:** Allow popups for localhost in browser settings

### Issue: "Not authenticated" API error
**Solution:** Log out and log back in to refresh session

### Issue: Database insertion fails
**Solution:** Check if `aura_id` column exists and migration was applied

### Issue: Connection appears to work but doesn't persist
**Solution:** Check if the API call is actually succeeding (look for ✅ success message)

### Issue: No console logs appear at all
**Solution:** Check for JavaScript errors preventing code execution

## 🧪 Manual Tests

### Test 1: Direct API Test
Run this in browser console while logged in:
```javascript
fetch('/api/oauth-connections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'test_provider',
    sense_type: 'fitness',
    provider_user_id: 'test@example.com',
    access_token: 'test_token',
    aura_id: 'YOUR_AURA_ID_HERE' // Get this from the auras table
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### Test 2: Check Existing Connections
```javascript
fetch('/api/oauth-connections')
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## 📊 Success Criteria
- [ ] OAuth popup opens and completes successfully
- [ ] All debug messages appear in correct order
- [ ] API request succeeds with 201 status
- [ ] New row appears in `oauth_connections` table
- [ ] Connection shows as "Connected" in UI
- [ ] Connection persists across page refreshes