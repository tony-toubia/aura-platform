@echo off
echo Granting Cloud Run service account access to all secrets...
echo.

set SERVICE_ACCOUNT=205298800820-compute@developer.gserviceaccount.com
set PROJECT_ID=aura-platform-467500

echo === Granting access to API and Authentication secrets ===
echo.

echo Granting access to OPENAI_API_KEY...
gcloud secrets add-iam-policy-binding OPENAI_API_KEY --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to JWT_SECRET...
gcloud secrets add-iam-policy-binding JWT_SECRET --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to SUPABASE_SERVICE_ROLE_KEY...
gcloud secrets add-iam-policy-binding SUPABASE_SERVICE_ROLE_KEY --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to OPENWEATHER_API_KEY...
gcloud secrets add-iam-policy-binding OPENWEATHER_API_KEY --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to NEWS_API_KEY...
gcloud secrets add-iam-policy-binding NEWS_API_KEY --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo.
echo === Granting access to OAuth Client secrets ===
echo.

echo Granting access to GOOGLE_CLIENT_SECRET...
gcloud secrets add-iam-policy-binding GOOGLE_CLIENT_SECRET --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to MICROSOFT_CLIENT_SECRET...
gcloud secrets add-iam-policy-binding MICROSOFT_CLIENT_SECRET --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to STRAVA_CLIENT_SECRET...
gcloud secrets add-iam-policy-binding STRAVA_CLIENT_SECRET --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo.
echo Done! All secrets have been granted access to the Cloud Run service account.
echo.
echo To verify all secrets are accessible, run:
echo gcloud secrets list --project=%PROJECT_ID%