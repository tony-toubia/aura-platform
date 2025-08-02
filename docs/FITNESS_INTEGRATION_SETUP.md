# Fitness Integration Setup Guide

This guide will walk you through obtaining API credentials for all four fitness platforms integrated into the Aura Platform.

## 🏃‍♂️ Google Fit Integration

### ✅ **GOOD NEWS: You Can Reuse Your Existing Google Credentials!**

Since you already have Google Calendar OAuth set up, you can use the **same credentials** for Google Fit. You just need to:

### Step 1: Add Google Fitness API to Your Existing Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your **existing project** (the one used for Google Calendar)
3. Enable the **Google Fitness API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Fitness API"
   - Click "Enable"

### Step 2: Update Your Existing OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Click "Edit App"
3. In the "Scopes" section, add these fitness scopes:
   - `https://www.googleapis.com/auth/fitness.activity.read`
   - `https://www.googleapis.com/auth/fitness.heart_rate.read`
   - `https://www.googleapis.com/auth/fitness.location.read`
   - `https://www.googleapis.com/auth/fitness.body.read`

### Step 3: Update Your Existing OAuth Client
1. Go to "APIs & Services" → "Credentials"
2. Find your existing OAuth 2.0 Client ID
3. Click the edit button (pencil icon)
4. Add this redirect URI: `http://localhost:3000/api/auth/google-fit/callback`
5. Save changes

### Step 4: Reuse Your Environment Variables
```env
# Use your EXISTING Google credentials for both Calendar AND Fit!
NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID=your_existing_google_client_id
GOOGLE_FIT_CLIENT_SECRET=your_existing_google_client_secret

# These should be the same as:
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_existing_google_client_id
# GOOGLE_CLIENT_SECRET=your_existing_google_client_secret
```

### 💡 **Pro Tip: Simplify Even Further**
You can actually use the **exact same environment variables** by updating the Google Fit integration to use the existing Google Calendar credentials. This means you only need:

```env
# One set of Google credentials for BOTH Calendar and Fit
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_existing_google_client_id
GOOGLE_CLIENT_SECRET=your_existing_google_client_secret
```

---

## 💪 Fitbit Integration

### Step 1: Create a Fitbit Developer Account
1. Go to [Fitbit Developer Portal](https://dev.fitbit.com/)
2. Sign up or log in with your Fitbit account
3. Click "Register an App"

### Step 2: Register Your Application
1. Fill out the application form:
   - **Application Name**: "Aura Platform"
   - **Description**: "Personal AI assistant with fitness tracking integration"
   - **Application Website**: Your domain (or `http://localhost:3000` for development)
   - **Organization**: Your organization name
   - **Organization Website**: Your website
   - **Terms of Service URL**: Your terms URL
   - **Privacy Policy URL**: Your privacy policy URL
   - **OAuth 2.0 Application Type**: "Server"
   - **Callback URL**: `http://localhost:3000/api/auth/fitbit/callback`
   - **Default Access Type**: "Read Only"

### Step 3: Required Scopes
Select these scopes for comprehensive fitness data:
- `activity` - Daily activity stats, exercise logs
- `heartrate` - Heart rate data
- `location` - GPS and location data from exercises
- `nutrition` - Food logging data (optional)
- `profile` - Basic profile information
- `settings` - User preferences
- `sleep` - Sleep logs and stages
- `social` - Friends and leaderboards (optional)
- `weight` - Weight and body composition

### Step 4: Environment Variables
```env
NEXT_PUBLIC_FITBIT_CLIENT_ID=your_fitbit_client_id_here
FITBIT_CLIENT_SECRET=your_fitbit_client_secret_here
```

---

## 🚴‍♂️ Strava Integration

### Step 1: Create a Strava API Application
1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Log in to your Strava account
3. Click "Create App"

### Step 2: Fill Out Application Details
1. **Application Name**: "Aura Platform"
2. **Category**: "Training"
3. **Club**: Leave blank (unless you have a specific club)
4. **Website**: Your website URL (or `http://localhost:3000`)
5. **Application Description**: "Personal AI assistant that integrates with your fitness activities to provide personalized insights and recommendations."
6. **Authorization Callback Domain**: `localhost` (for development) or your production domain

### Step 3: Configure Scopes
The integration uses these scopes:
- `read` - Read public segments, public activities, public profile data
- `activity:read_all` - Read all activities (including private)
- `profile:read_all` - Read all profile information

### Step 4: Environment Variables
```env
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here
```

---

## 🍎 Apple Health Integration

### Important Note
Apple Health (HealthKit) is primarily designed for native iOS apps. For web applications, there are two approaches:

### Option 1: Apple Sign-In (Recommended for Web)
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple ID
3. Go to "Certificates, Identifiers & Profiles"
4. Create a new App ID:
   - Description: "Aura Platform"
   - Bundle ID: `com.yourcompany.aura-platform`
   - Enable "Sign In with Apple"

### Option 2: HealthKit (iOS App Required)
For full HealthKit integration, you'll need:
1. **iOS Developer Account** ($99/year)
2. **Native iOS App** that can:
   - Access HealthKit data
   - Send data to your web API
   - Handle OAuth-like authentication

### Step 3: Web Integration Setup
For web-based Apple integration:
1. Create a Service ID in Apple Developer Portal
2. Configure domains and redirect URLs
3. Generate a private key for server-to-server authentication

### Step 4: Environment Variables
```env
NEXT_PUBLIC_APPLE_HEALTH_CLIENT_ID=your_apple_service_id_here
APPLE_HEALTH_CLIENT_SECRET=your_apple_private_key_here
```

---

## 🔧 Development Setup

### 1. Add Environment Variables
Create a `.env.local` file in your project root:

```env
# Google Fit
NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID=your_google_fit_client_id
GOOGLE_FIT_CLIENT_SECRET=your_google_fit_client_secret

# Fitbit
NEXT_PUBLIC_FITBIT_CLIENT_ID=your_fitbit_client_id
FITBIT_CLIENT_SECRET=your_fitbit_client_secret

# Strava
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# Apple Health (if using)
NEXT_PUBLIC_APPLE_HEALTH_CLIENT_ID=your_apple_service_id
APPLE_HEALTH_CLIENT_SECRET=your_apple_private_key
```

### 2. Update Callback URLs for Production
When deploying to production, update all callback URLs to use your production domain:
- Google Fit: `https://yourdomain.com/api/auth/google-fit/callback`
- Fitbit: `https://yourdomain.com/api/auth/fitbit/callback`
- Strava: `yourdomain.com` (domain only)
- Apple: `https://yourdomain.com/api/auth/apple-health/callback`

### 3. Test the Integration
1. Start your development server: `npm run dev`
2. Navigate to the Aura creation flow
3. Try connecting each fitness service
4. Check browser console for any OAuth errors

---

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS for all callback URLs
- [ ] Store client secrets securely (environment variables, not in code)
- [ ] Implement proper token storage and encryption
- [ ] Add rate limiting to API endpoints
- [ ] Implement token refresh logic
- [ ] Add proper error handling and logging
- [ ] Review and minimize requested scopes
- [ ] Implement user consent management
- [ ] Add data retention policies
- [ ] Regular security audits of integrations

### Privacy Compliance
- Clearly explain what data you're accessing
- Provide easy disconnection options
- Implement data deletion on user request
- Follow GDPR/CCPA requirements if applicable
- Regular privacy policy updates

---

## 🚨 Troubleshooting

### Common Issues

#### Google Fit
- **Error**: "Access blocked: This app's request is invalid"
  - **Solution**: Verify OAuth consent screen is published and scopes are correctly configured

#### Fitbit
- **Error**: "invalid_client"
  - **Solution**: Check that callback URL exactly matches what's registered in Fitbit app settings

#### Strava
- **Error**: "Bad Request"
  - **Solution**: Ensure callback domain matches exactly (no http/https prefix)

#### Apple Health
- **Error**: "Invalid client"
  - **Solution**: Verify Service ID configuration and private key setup

### Getting Help
- Google Fit: [Google Fitness API Documentation](https://developers.google.com/fit)
- Fitbit: [Fitbit Web API Documentation](https://dev.fitbit.com/build/reference/web-api/)
- Strava: [Strava API Documentation](https://developers.strava.com/)
- Apple Health: [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)

---

## 📊 Data Access Summary

| Platform | Steps | Heart Rate | Sleep | Workouts | Nutrition | Location |
|----------|-------|------------|-------|----------|-----------|----------|
| Google Fit | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Fitbit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Strava | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Apple Health | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

This comprehensive setup will give your Aura Platform access to rich fitness data from multiple sources, enabling personalized health insights and recommendations!