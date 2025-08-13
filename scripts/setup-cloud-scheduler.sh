#!/bin/bash

# ============================================
# Google Cloud Scheduler Setup Script
# For Proactive Notifications System
# ============================================

set -e

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"your-gcp-project-id"}
REGION=${GCP_REGION:-"us-central1"}
DOMAIN=${DEPLOYMENT_DOMAIN:-"your-domain.com"}
CRON_SECRET=${CRON_SECRET:-"your-secure-cron-secret-minimum-32-chars"}
SERVICE_ACCOUNT=${SERVICE_ACCOUNT:-"scheduler-sa@${PROJECT_ID}.iam.gserviceaccount.com"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setting up Google Cloud Scheduler${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
echo -e "${YELLOW}Setting project to: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable appengine.googleapis.com

# Check if App Engine app exists (required for Cloud Scheduler)
if ! gcloud app describe &> /dev/null; then
    echo -e "${YELLOW}Creating App Engine app (required for Cloud Scheduler)...${NC}"
    gcloud app create --region=${REGION}
fi

# Create service account if it doesn't exist
echo -e "${YELLOW}Setting up service account...${NC}"
if ! gcloud iam service-accounts describe ${SERVICE_ACCOUNT} &> /dev/null 2>&1; then
    gcloud iam service-accounts create scheduler-sa \
        --display-name="Cloud Scheduler Service Account"
fi

# ============================================
# Create Rule Evaluation Job (every 5 minutes)
# ============================================
echo -e "${YELLOW}Creating rule evaluation job...${NC}"

JOB_NAME="proactive-rule-evaluation"
if gcloud scheduler jobs describe ${JOB_NAME} --location=${REGION} &> /dev/null 2>&1; then
    echo -e "${YELLOW}Job ${JOB_NAME} already exists, updating...${NC}"
    gcloud scheduler jobs update http ${JOB_NAME} \
        --location=${REGION} \
        --schedule="*/5 * * * *" \
        --uri="https://${DOMAIN}/api/cron/evaluate-rules" \
        --http-method=POST \
        --headers="x-cron-secret=${CRON_SECRET},content-type=application/json" \
        --message-body="{\"source\":\"cloud-scheduler\"}" \
        --time-zone="UTC" \
        --attempt-deadline="540s" \
        --max-retry-attempts=3 \
        --min-backoff="10s" \
        --max-backoff="60s"
else
    echo -e "${GREEN}Creating job ${JOB_NAME}...${NC}"
    gcloud scheduler jobs create http ${JOB_NAME} \
        --location=${REGION} \
        --schedule="*/5 * * * *" \
        --uri="https://${DOMAIN}/api/cron/evaluate-rules" \
        --http-method=POST \
        --headers="x-cron-secret=${CRON_SECRET},content-type=application/json" \
        --message-body="{\"source\":\"cloud-scheduler\"}" \
        --time-zone="UTC" \
        --attempt-deadline="540s" \
        --max-retry-attempts=3 \
        --min-backoff="10s" \
        --max-backoff="60s"
fi

# ============================================
# Create Notification Processing Job (every minute)
# ============================================
echo -e "${YELLOW}Creating notification processing job...${NC}"

JOB_NAME="proactive-notification-processing"
if gcloud scheduler jobs describe ${JOB_NAME} --location=${REGION} &> /dev/null 2>&1; then
    echo -e "${YELLOW}Job ${JOB_NAME} already exists, updating...${NC}"
    gcloud scheduler jobs update http ${JOB_NAME} \
        --location=${REGION} \
        --schedule="* * * * *" \
        --uri="https://${DOMAIN}/api/cron/process-notifications" \
        --http-method=POST \
        --headers="x-cron-secret=${CRON_SECRET},content-type=application/json" \
        --message-body="{\"source\":\"cloud-scheduler\"}" \
        --time-zone="UTC" \
        --attempt-deadline="50s" \
        --max-retry-attempts=2 \
        --min-backoff="5s" \
        --max-backoff="30s"
else
    echo -e "${GREEN}Creating job ${JOB_NAME}...${NC}"
    gcloud scheduler jobs create http ${JOB_NAME} \
        --location=${REGION} \
        --schedule="* * * * *" \
        --uri="https://${DOMAIN}/api/cron/process-notifications" \
        --http-method=POST \
        --headers="x-cron-secret=${CRON_SECRET},content-type=application/json" \
        --message-body="{\"source\":\"cloud-scheduler\"}" \
        --time-zone="UTC" \
        --attempt-deadline="50s" \
        --max-retry-attempts=2 \
        --min-backoff="5s" \
        --max-backoff="30s"
fi

# ============================================
# Create Cleanup Job (daily at 2 AM UTC)
# ============================================
echo -e "${YELLOW}Creating cleanup job...${NC}"

JOB_NAME="proactive-notification-cleanup"
if gcloud scheduler jobs describe ${JOB_NAME} --location=${REGION} &> /dev/null 2>&1; then
    echo -e "${YELLOW}Job ${JOB_NAME} already exists, updating...${NC}"
    gcloud scheduler jobs update http ${JOB_NAME} \
        --location=${REGION} \
        --schedule="0 2 * * *" \
        --uri="https://${DOMAIN}/api/cron/cleanup-notifications" \
        --http-method=POST \
        --headers="x-cron-secret=${CRON_SECRET},content-type=application/json" \
        --message-body="{\"source\":\"cloud-scheduler\",\"days\":30}" \
        --time-zone="UTC" \
        --attempt-deadline="300s" \
        --max-retry-attempts=3
else
    echo -e "${GREEN}Creating job ${JOB_NAME}...${NC}"
    gcloud scheduler jobs create http ${JOB_NAME} \
        --location=${REGION} \
        --schedule="0 2 * * *" \
        --uri="https://${DOMAIN}/api/cron/cleanup-notifications" \
        --http-method=POST \
        --headers="x-cron-secret=${CRON_SECRET},content-type=application/json" \
        --message-body="{\"source\":\"cloud-scheduler\",\"days\":30}" \
        --time-zone="UTC" \
        --attempt-deadline="300s" \
        --max-retry-attempts=3
fi

# ============================================
# List all jobs
# ============================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Cloud Scheduler jobs created/updated:${NC}"
echo -e "${GREEN}========================================${NC}"
gcloud scheduler jobs list --location=${REGION}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your .env file with the CRON_SECRET value"
echo "2. Deploy your application"
echo "3. Test the cron endpoints manually:"
echo "   curl -X POST https://${DOMAIN}/api/cron/evaluate-rules \\"
echo "     -H 'x-cron-secret: ${CRON_SECRET}' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{}'"
echo ""
echo "4. Monitor jobs at: https://console.cloud.google.com/cloudscheduler"