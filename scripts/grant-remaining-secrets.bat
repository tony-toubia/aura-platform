@echo off
echo Granting access to remaining secrets...

gcloud secrets add-iam-policy-binding OPENWEATHER_API_KEY --member="serviceAccount:205298800820-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=aura-platform-467500

gcloud secrets add-iam-policy-binding NEWS_API_KEY --member="serviceAccount:205298800820-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=aura-platform-467500

gcloud secrets add-iam-policy-binding GOOGLE_CLIENT_SECRET --member="serviceAccount:205298800820-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=aura-platform-467500

gcloud secrets add-iam-policy-binding MICROSOFT_CLIENT_SECRET --member="serviceAccount:205298800820-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=aura-platform-467500

gcloud secrets add-iam-policy-binding STRAVA_CLIENT_SECRET --member="serviceAccount:205298800820-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor" --project=aura-platform-467500

echo Done!