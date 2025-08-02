# Azure App Registration Setup Guide

This is a step-by-step visual guide for setting up Microsoft Outlook calendar integration in the Azure Portal.

## Step 1: Navigate to App Registrations

1. In the Azure Portal, search for "**App registrations**" in the top search bar
2. Click on "**App registrations**" from the results
3. Click the "**+ New registration**" button

## Step 2: Fill Out the Registration Form

### Application Name
```
Aura Platform Calendar Integration
```

### Supported Account Types
Select the **third option**:
```
☑️ Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)
```

**Why this option?**
- Allows both business Microsoft 365 accounts AND personal Microsoft accounts
- Maximum compatibility for your users
- Most flexible option for a public application

### Redirect URI
- **Platform**: Select "**Web**" from the dropdown
- **URI**: Enter your callback URL:
  - For development: `http://localhost:3000/api/auth/microsoft/callback`
  - For production: `https://yourdomain.com/api/auth/microsoft/callback`

Click "**Register**"

## Step 3: Configure API Permissions

After registration, you'll be on the app overview page:

1. Click "**API permissions**" in the left sidebar
2. Click "**+ Add a permission**"
3. Select "**Microsoft Graph**" (the big blue icon)
4. Choose "**Delegated permissions**" (not Application permissions)
5. Search for and check these permissions:
   - `Calendars.Read` - Read user calendars
   - `User.Read` - Sign in and read user profile
   - `offline_access` - Maintain access to data you have given it access to

6. Click "**Add permissions**"
7. **Optional but recommended**: Click "**Grant admin consent for [Your Organization]**" if you have admin rights

## Step 4: Create Client Secret

1. Click "**Certificates & secrets**" in the left sidebar
2. Under "Client secrets" section, click "**+ New client secret**"
3. **Description**: `Aura Platform OAuth Secret`
4. **Expires**: Select "**24 months**" (recommended for production)
5. Click "**Add**"
6. **🚨 CRITICAL**: Copy the secret **Value** immediately - you'll never see it again!

## Step 5: Copy Your Credentials

From the "**Overview**" page, copy these two values:

### Application (client) ID
- This is a GUID that looks like: `12345678-1234-1234-1234-123456789abc`
- This goes in your environment variable: `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`

### Client Secret Value
- This is the secret you just created and copied
- This goes in your environment variable: `MICROSOFT_CLIENT_SECRET`

## Step 6: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Microsoft OAuth Configuration
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_application_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_value_here
```

## Step 7: Optional Branding (Recommended)

1. Click "**Branding & properties**" in the left sidebar
2. Upload your app logo (optional)
3. Add publisher domain (optional)
4. This makes the OAuth consent screen look more professional to users

## Quick Verification Checklist ✅

Before testing, verify:

- [ ] App registered with "**Multitenant and personal accounts**" support
- [ ] Redirect URI matches your callback endpoint exactly
- [ ] Three API permissions added: `Calendars.Read`, `User.Read`, `offline_access`
- [ ] Client secret created and value copied
- [ ] Environment variables added to `.env.local`
- [ ] Development server restarted after adding environment variables

## Testing Your Setup

1. Start your development server: `npm run dev`
2. Navigate to Aura creation/editing in your app
3. Select "Calendar" sense
4. Click "Connect" on Microsoft Outlook
5. You should see a Microsoft login popup
6. After login, you should see calendar permission request
7. After granting permissions, the connection should succeed

## Common Issues & Solutions

### "Client ID not configured" Error
- Check that `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` is set in `.env.local`
- Restart your development server after adding environment variables

### "Redirect URI mismatch" Error
- Ensure the redirect URI in Azure exactly matches your callback URL
- Check for typos, trailing slashes, http vs https

### "Permission denied" Error
- Verify all three API permissions are added in Azure
- Try granting admin consent if you have admin rights

### Popup Blocked
- Allow popups for your development domain
- Some browsers block popups by default

## Production Deployment Notes

When deploying to production:

1. **Update Redirect URI**: Add your production domain to Azure app registration
2. **Environment Variables**: Set production environment variables securely
3. **HTTPS Required**: Microsoft requires HTTPS for production OAuth flows
4. **Domain Verification**: Consider verifying your publisher domain in Azure

## Security Best Practices

- **Never expose client secret** in frontend code or public repositories
- **Use HTTPS** in production
- **Rotate secrets** periodically (every 12-24 months)
- **Monitor OAuth flows** for unusual activity
- **Implement proper token storage** with encryption in production

Need help with any step? The setup should work once all steps are completed correctly!