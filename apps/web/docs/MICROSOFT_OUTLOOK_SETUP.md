# Microsoft Outlook Calendar Integration Setup

This guide explains how to set up Microsoft Outlook calendar integration for the Aura Platform.

## Overview

The Microsoft Outlook integration allows users to connect their Outlook/Microsoft 365 calendars as a "sense" for their Auras. This enables Auras to understand the user's schedule, meetings, and availability to provide more contextual responses.

## Architecture

The integration follows the same pattern as Google Calendar:

1. **OAuth Flow**: Uses Microsoft Graph API OAuth 2.0
2. **Frontend**: React components with popup-based OAuth
3. **Backend**: API routes for token exchange and refresh
4. **Security**: Client-side OAuth with server-side token handling

## Files Created

### OAuth Library
- `apps/web/lib/oauth/microsoft-outlook.ts` - Microsoft Graph OAuth client

### API Routes
- `apps/web/app/api/auth/microsoft/exchange.ts` - Token exchange endpoint
- `apps/web/app/api/auth/microsoft/callback.ts` - OAuth callback handler
- `apps/web/app/api/auth/microsoft/refresh.ts` - Token refresh endpoint

### UI Integration
- Updated `apps/web/components/aura/oauth-connection-modal.tsx` to include Microsoft OAuth

## Microsoft Azure App Registration

To enable this integration, you need to register an application in Microsoft Azure:

### 1. Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in the details:
   - **Name**: "Aura Platform Calendar Integration"
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: 
     - Type: Web
     - URL: `https://yourdomain.com/api/auth/microsoft/callback`
     - For development: `http://localhost:3000/api/auth/microsoft/callback`

### 2. Configure API Permissions

1. Go to "API permissions" in your app registration
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Choose "Delegated permissions"
5. Add these permissions:
   - `Calendars.Read` - Read user calendars
   - `User.Read` - Read user profile
   - `offline_access` - Maintain access to data

### 3. Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Add description: "Aura Platform OAuth Secret"
4. Choose expiration (recommend 24 months)
5. Copy the secret value (you won't see it again!)

### 4. Note Important Values

From your app registration, copy these values:
- **Application (client) ID** - This is your `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
- **Client secret** - This is your `MICROSOFT_CLIENT_SECRET`
- **Directory (tenant) ID** - Not needed for multi-tenant apps

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Microsoft OAuth Configuration
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here
```

## Microsoft Graph API Scopes

The integration requests these scopes:

- `https://graph.microsoft.com/calendars.read` - Read user's calendar events
- `https://graph.microsoft.com/user.read` - Read user's basic profile
- `offline_access` - Get refresh tokens for long-term access

## API Endpoints Used

### Microsoft Graph Calendar API
- **Base URL**: `https://graph.microsoft.com/v1.0`
- **Events**: `/me/events` - Get user's calendar events
- **Profile**: `/me` - Get user's profile information

### Query Parameters
- `$select` - Choose specific fields to return
- `$filter` - Filter events by date range
- `$orderby` - Sort events by start time
- `$top` - Limit number of results

## Security Considerations

1. **Client Secret**: Store securely, never expose in frontend code
2. **Token Storage**: In production, encrypt and store tokens in database
3. **Scope Limitation**: Only request minimum necessary permissions
4. **Token Refresh**: Implement automatic token refresh for long-term access
5. **Error Handling**: Gracefully handle expired tokens and permission errors

## Testing the Integration

1. Set up environment variables
2. Start the development server
3. Navigate to Aura creation/editing
4. Select "Calendar" sense
5. Click "Connect" on Microsoft Outlook
6. Complete OAuth flow in popup
7. Verify connection success

## Production Deployment

### Azure App Registration Updates
1. Update redirect URI to production domain
2. Add production domain to CORS origins if needed
3. Consider using certificate authentication instead of client secret

### Environment Variables
1. Set production environment variables
2. Use secure secret management (Azure Key Vault, etc.)
3. Enable logging for OAuth flows

### Monitoring
1. Monitor OAuth success/failure rates
2. Track token refresh patterns
3. Alert on authentication errors

## Troubleshooting

### Common Issues

1. **"Microsoft Client ID not configured"**
   - Ensure `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` is set
   - Verify environment variable is loaded

2. **"Token exchange failed"**
   - Check client secret is correct
   - Verify redirect URI matches Azure registration
   - Check network connectivity to Microsoft endpoints

3. **"Permission denied"**
   - Verify API permissions are granted in Azure
   - Check if admin consent is required
   - Ensure user has necessary permissions

4. **Popup blocked**
   - Instruct users to allow popups
   - Consider alternative OAuth flow for strict environments

### Debug Steps

1. Check browser console for errors
2. Verify network requests to Microsoft endpoints
3. Test OAuth flow manually in browser
4. Check Azure app registration configuration
5. Validate environment variables

## Future Enhancements

1. **Calendar Selection**: Allow users to choose specific calendars
2. **Event Filtering**: Filter by event types, attendees, etc.
3. **Real-time Updates**: Webhook integration for live calendar changes
4. **Meeting Insights**: Extract meeting patterns and insights
5. **Cross-platform**: Support for Outlook mobile apps

## Related Documentation

- [Microsoft Graph Calendar API](https://docs.microsoft.com/en-us/graph/api/resources/calendar)
- [Microsoft OAuth 2.0 Flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [Azure App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)