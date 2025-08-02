# OAuth Connection Debugging Steps

## Step 1: Run Database Migration
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `run-this-in-supabase.sql`
4. Run the SQL script
5. Verify that the `aura_id` column was added successfully

## Step 2: Test the OAuth Flow
1. Open your browser and navigate to your app
2. Open Developer Tools (F12) and go to the Console tab
3. Navigate to edit an aura
4. Click on the "Fitness" sense to configure it
5. Try to connect Google Fit

## Step 3: Check Console Logs
Look for these debug messages in the console (in order):

### When you click "Connect" on Google Fit:
```
🎯 handleConnect called: {providerId: "google_fit", senseType: "fitness", auraId: "...", timestamp: "..."}
🔑 Environment check: {hasGoogleFitClientId: false, hasGoogleClientId: true, clientId: "205298800..."}
🚀 Starting Google Fit OAuth flow...
```

### If OAuth completes successfully:
```
🎉 Google Fit OAuth completed: {hasAccessToken: true, hasRefreshToken: true, expiresIn: 3600, scope: "..."}
📋 Created connection data: {providerId: "google_fit", providerName: "Google Fit", ...}
📞 Calling onConnectionComplete...
🔗 handleOAuthConnection called: {senseId: "fitness", providerId: "google_fit", connectionData: {...}, auraId: "..."}
📤 Making API request to save OAuth connection: {provider: "google_fit", sense_type: "fitness", ...}
📥 API response: {ok: true, status: 201, statusText: "Created"}
✅ Successfully saved OAuth connection: {id: "...", provider: "google_fit", ...}
```

## Step 4: Common Issues and Solutions

### Issue: "Google Client ID not configured"
**Cause**: Environment variables not loaded
**Solution**: Restart your development server after adding environment variables

### Issue: OAuth popup blocked
**Cause**: Browser blocking popups
**Solution**: Allow popups for localhost in browser settings

### Issue: "Failed to exchange code for token"
**Cause**: Missing or incorrect `GOOGLE_CLIENT_SECRET`
**Solution**: Check that `GOOGLE_CLIENT_SECRET` is set in `.env.local`

### Issue: API returns 400 "Missing required fields"
**Cause**: Database migration not run or missing aura_id
**Solution**: Run the database migration SQL script

### Issue: API returns 401 "Not authenticated"
**Cause**: User not logged in or session expired
**Solution**: Log out and log back in

### Issue: API returns 409 "Connection already exists"
**Cause**: Duplicate connection for the same provider and aura
**Solution**: This is expected behavior - connection already exists

### Issue: No console logs appear
**Cause**: JavaScript errors preventing execution
**Solution**: Check for any red error messages in console first

## Step 5: Manual Database Check
After attempting to connect, check if the connection was saved:

```sql
-- Check recent OAuth connections
SELECT 
  id,
  provider,
  sense_type,
  aura_id,
  user_id,
  created_at
FROM public.oauth_connections 
ORDER BY created_at DESC 
LIMIT 10;

-- Check connections for a specific aura
SELECT 
  id,
  provider,
  sense_type,
  provider_user_id,
  created_at
FROM public.oauth_connections 
WHERE aura_id = 'YOUR_AURA_ID_HERE'
ORDER BY created_at DESC;
```

## Step 6: Test API Endpoint Directly
You can test the API endpoint using the browser's console:

```javascript
// Run this in the browser console while logged in
fetch('/api/oauth-connections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'google_fit',
    sense_type: 'fitness',
    provider_user_id: 'test@example.com',
    access_token: 'test_token',
    aura_id: 'YOUR_AURA_ID_HERE' // Replace with actual aura ID
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Step 7: Check Network Tab
In Developer Tools, go to the Network tab and look for:
- POST request to `/api/oauth-connections`
- Check the request payload
- Check the response status and body
- Look for any failed requests

## Expected Behavior
After successful connection:
1. The OAuth popup should close automatically
2. The Google Fit provider should show as "Connected" in the UI
3. A new record should appear in the `oauth_connections` table
4. The connection should persist when you refresh the page or edit the aura again

## If All Else Fails
1. Check the server logs for any backend errors
2. Try connecting a different provider (like Google Calendar) to isolate the issue
3. Clear browser cache and cookies
4. Try in an incognito/private browser window