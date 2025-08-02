# Client Secret: Value vs Secret ID - Which One to Use?

## Quick Answer
You need the **"Value"** - NOT the "Secret ID"!

## What You See in Azure
When you create a client secret in Azure, you'll see two things:

```
┌─────────────────────────────────────────────────────────────┐
│ Client secrets                                              │
├─────────────────────────────────────────────────────────────┤
│ Description: Aura Platform OAuth Secret                    │
│ Secret ID: 12345678-abcd-1234-efgh-567890123456           │ ← DON'T use this
│ Value: A1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4  │ ← USE THIS!
│ Expires: 12/31/2025                                        │
└─────────────────────────────────────────────────────────────┘
```

## Which One Goes Where?

### ✅ Use the "Value" 
- **What it looks like**: A long random string like `A1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4`
- **Length**: Usually 40+ characters
- **Where to use it**: In your `MICROSOFT_CLIENT_SECRET` environment variable

### ❌ Don't Use the "Secret ID"
- **What it looks like**: A GUID like `12345678-abcd-1234-efgh-567890123456`
- **Purpose**: Just an identifier for Azure to track which secret this is
- **Don't use**: This won't work for OAuth authentication

## Environment Variables Setup

### Local Development (.env.local)
```bash
# Microsoft OAuth Configuration
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_application_client_id_from_overview_page
MICROSOFT_CLIENT_SECRET=A1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4
```

### Production (Vercel Environment Variables)
**Yes, you should add both to Vercel!**

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add these two variables:

**Variable 1:**
- **Name**: `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
- **Value**: Your Application (client) ID from Azure Overview page
- **Environment**: Production, Preview, Development (check all)

**Variable 2:**
- **Name**: `MICROSOFT_CLIENT_SECRET`
- **Value**: The "Value" from your Azure client secret (the long random string)
- **Environment**: Production, Preview, Development (check all)

## Why Both Environments?

### Local (.env.local)
- For development and testing on your machine
- Never commit this file to git (it should be in .gitignore)

### Vercel Environment Variables
- For your deployed application to work in production
- Secure and encrypted by Vercel
- Accessible to your API routes when deployed

## Security Notes

### The Client Secret "Value" is HIGHLY SENSITIVE
- **Never** put it in frontend code
- **Never** commit it to git
- **Only** use it in server-side API routes
- **Rotate** it periodically (every 12-24 months)

### The Client ID is Public
- Safe to use in frontend code (that's why it starts with `NEXT_PUBLIC_`)
- Can be seen by users in browser
- Not sensitive information

## Testing Your Setup

After adding both variables:

### Local Testing
1. Restart your development server: `npm run dev`
2. Test the Microsoft Outlook connection

### Production Testing
1. Deploy to Vercel: `vercel --prod` or push to your connected git branch
2. Test the Microsoft Outlook connection on your live site

## Common Mistakes

❌ **Using Secret ID instead of Value**
❌ **Forgetting to add to Vercel environment variables**
❌ **Not restarting development server after adding .env.local**
❌ **Committing .env.local to git**

✅ **Using the long "Value" string**
✅ **Adding to both local and Vercel environments**
✅ **Restarting server after environment changes**
✅ **Keeping secrets secure**

## Summary

- **Client Secret Value** (long random string) → `MICROSOFT_CLIENT_SECRET`
- **Application Client ID** (GUID from Overview) → `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
- **Add to both** `.env.local` AND Vercel environment variables
- **Restart** development server after adding environment variables