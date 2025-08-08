# Next Steps - Using Secrets in Cloud Run

Your Stripe secrets have been successfully created in Google Cloud Secret Manager for project `aura-platform-467500`:

✅ STRIPE_SECRET_KEY  
✅ STRIPE_PUBLISHABLE_KEY  
✅ STRIPE_WEBHOOK_SECRET  
✅ STRIPE_PERSONAL_PRICE_ID  
✅ STRIPE_FAMILY_PRICE_ID  
✅ STRIPE_BUSINESS_PRICE_ID  

## 1. Grant Cloud Run Service Account Access

First, identify your Cloud Run service account:
```bash
# List your Cloud Run services
gcloud run services list --project=aura-platform-467500

# Get the service account for a specific service
gcloud run services describe YOUR_SERVICE_NAME --region=YOUR_REGION --project=aura-platform-467500 --format="value(spec.template.spec.serviceAccountName)"
```

Then grant access to the secrets:
```bash
# Replace with your actual service account
SERVICE_ACCOUNT="YOUR_SERVICE_ACCOUNT@aura-platform-467500.iam.gserviceaccount.com"

# Grant access to all Stripe secrets
for SECRET in STRIPE_SECRET_KEY STRIPE_PUBLISHABLE_KEY STRIPE_WEBHOOK_SECRET STRIPE_PERSONAL_PRICE_ID STRIPE_FAMILY_PRICE_ID STRIPE_BUSINESS_PRICE_ID; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --project=aura-platform-467500
done
```

## 2. Update Your Cloud Run Deployment

### Option A: Using gcloud deploy command
```bash
gcloud run deploy YOUR_SERVICE_NAME \
  --region=YOUR_REGION \
  --project=aura-platform-467500 \
  --update-secrets=STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=STRIPE_PUBLISHABLE_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,STRIPE_PERSONAL_PRICE_ID=STRIPE_PERSONAL_PRICE_ID:latest,STRIPE_FAMILY_PRICE_ID=STRIPE_FAMILY_PRICE_ID:latest,STRIPE_BUSINESS_PRICE_ID=STRIPE_BUSINESS_PRICE_ID:latest
```

### Option B: Using a service.yaml file
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: YOUR_SERVICE_NAME
spec:
  template:
    spec:
      containers:
      - image: gcr.io/aura-platform-467500/YOUR_IMAGE
        env:
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: STRIPE_SECRET_KEY
              key: latest
        - name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          valueFrom:
            secretKeyRef:
              name: STRIPE_PUBLISHABLE_KEY
              key: latest
        - name: STRIPE_WEBHOOK_SECRET
          valueFrom:
            secretKeyRef:
              name: STRIPE_WEBHOOK_SECRET
              key: latest
        - name: STRIPE_PERSONAL_PRICE_ID
          valueFrom:
            secretKeyRef:
              name: STRIPE_PERSONAL_PRICE_ID
              key: latest
        - name: STRIPE_FAMILY_PRICE_ID
          valueFrom:
            secretKeyRef:
              name: STRIPE_FAMILY_PRICE_ID
              key: latest
        - name: STRIPE_BUSINESS_PRICE_ID
          valueFrom:
            secretKeyRef:
              name: STRIPE_BUSINESS_PRICE_ID
              key: latest
```

Then deploy:
```bash
gcloud run services replace service.yaml --region=YOUR_REGION --project=aura-platform-467500
```

## 3. Verify Secrets are Accessible

After deployment, you can verify the environment variables are set:
```bash
# Check the service configuration
gcloud run services describe YOUR_SERVICE_NAME \
  --region=YOUR_REGION \
  --project=aura-platform-467500 \
  --format="value(spec.template.spec.containers[0].env[].name)"
```

## 4. Update Secrets (if needed)

To update a secret value in the future:
```bash
# Example: Update the webhook secret
echo -n "whsec_new_value_here" | gcloud secrets versions add STRIPE_WEBHOOK_SECRET --data-file=- --project=aura-platform-467500
```

The Cloud Run service will automatically use the latest version on the next deployment or container restart.

## Important Notes

- The environment variable names in your application should match what you set in Cloud Run
- For Next.js apps, variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Server-side only variables (like `STRIPE_SECRET_KEY`) should never have the `NEXT_PUBLIC_` prefix
- Make sure your application code references these environment variables correctly

## Troubleshooting

If secrets aren't working:
1. Check service account permissions: `gcloud secrets get-iam-policy SECRET_NAME --project=aura-platform-467500`
2. Verify secret exists: `gcloud secrets versions list SECRET_NAME --project=aura-platform-467500`
3. Check Cloud Run logs: `gcloud run services logs read YOUR_SERVICE_NAME --region=YOUR_REGION --project=aura-platform-467500`