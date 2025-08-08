@echo off
echo Granting Cloud Run service account access to Stripe secrets...
echo.

set SERVICE_ACCOUNT=205298800820-compute@developer.gserviceaccount.com
set PROJECT_ID=aura-platform-467500

echo Granting access to STRIPE_SECRET_KEY...
gcloud secrets add-iam-policy-binding STRIPE_SECRET_KEY --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to STRIPE_PUBLISHABLE_KEY...
gcloud secrets add-iam-policy-binding STRIPE_PUBLISHABLE_KEY --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to STRIPE_WEBHOOK_SECRET...
gcloud secrets add-iam-policy-binding STRIPE_WEBHOOK_SECRET --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to STRIPE_PERSONAL_PRICE_ID...
gcloud secrets add-iam-policy-binding STRIPE_PERSONAL_PRICE_ID --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to STRIPE_FAMILY_PRICE_ID...
gcloud secrets add-iam-policy-binding STRIPE_FAMILY_PRICE_ID --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo Granting access to STRIPE_BUSINESS_PRICE_ID...
gcloud secrets add-iam-policy-binding STRIPE_BUSINESS_PRICE_ID --member="serviceAccount:%SERVICE_ACCOUNT%" --role="roles/secretmanager.secretAccessor" --project=%PROJECT_ID%

echo.
echo Done! All secrets have been granted access to the Cloud Run service account.