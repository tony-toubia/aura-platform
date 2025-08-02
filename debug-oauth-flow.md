# Debug OAuth Flow

## Steps to Debug the OAuth Connection Issue

### 1. First, run the database migration
Execute this SQL in your Supabase SQL editor:

```sql
-- Add aura_id column to oauth_connections table
ALTER TABLE public.oauth_connections 
ADD COLUMN aura_id uuid REFERENCES public.auras(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_oauth_connections_aura_id ON public.oauth_connections(aura_id);
CREATE INDEX idx_oauth_connections_user_aura ON public.oauth_connections(user_id, aura_id);
```

### 2. Check Environment Variables
Make sure these environment variables are set in your `.env.local`:

```bash
# Google OAuth (required for Google Fit)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Specific Google Fit credentials (will fallback to Google Calendar creds)
NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID=your_google_fit_client_id
GOOGLE_FIT_CLIENT_SECRET=your_google_fit_client_secret
```

### 3. Test the OAuth Flow
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Navigate to edit an aura
4. Click on "Fitness" sense to configure it
5. Try to connect Google Fit
6. Watch the console for debug messages:
   - `🚀 Starting Google Fit OAuth flow...`
   - `🎉 Google Fit OAuth completed:`
   - `📋 Created connection data:`
   - `📞 Calling onConnectionComplete...`
   - `🔗 handleOAuthConnection called:`
   - `📤 Making API request to save OAuth connection:`
   - `📥 API response:`
   - `✅ Successfully saved OAuth connection:`

### 4. Check for Errors
Look for these error patterns in the console:
- `❌ OAuth connection failed:` - OAuth flow failed
- `❌ Failed to save OAuth connection - API error:` - API call failed
- `❌ Failed to save OAuth connection - Network/Parse error:` - Network issue

### 5. Check Database
After a successful connection, verify in Supabase:

```sql
-- Check if connections are being saved
SELECT * FROM public.oauth_connections ORDER BY created_at DESC LIMIT 5;

-- Check if aura_id is being set
SELECT 
  id, 
  provider, 
  sense_type, 
  aura_id, 
  user_id, 
  created_at 
FROM public.oauth_connections 
WHERE aura_id IS NOT NULL 
ORDER BY created_at DESC;
```

### 6. Common Issues and Solutions

#### Issue: "Google Client ID not configured"
**Solution**: Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to your environment variables

#### Issue: OAuth popup blocked
**Solution**: Allow popups for your domain in browser settings

#### Issue: "Failed to exchange code for token"
**Solution**: Check that `GOOGLE_CLIENT_SECRET` is set correctly

#### Issue: Connections not showing when editing aura
**Solution**: Make sure the database migration was run and aura_id is being passed correctly

#### Issue: API call returns 400/500 error
**Solution**: Check the API logs and ensure all required fields are being sent

### 7. Manual Test API Endpoint
You can test the API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/oauth-connections \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google_fit",
    "sense_type": "fitness",
    "provider_user_id": "test@example.com",
    "access_token": "test_token",
    "aura_id": "your_aura_id_here"
  }'
```

### 8. Check Network Tab
In browser DevTools, check the Network tab for:
- POST request to `/api/oauth-connections`
- Response status and body
- Any failed requests

This should help identify where exactly the OAuth connection flow is failing.