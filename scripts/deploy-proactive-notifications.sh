#!/bin/bash

# ============================================
# Proactive Notifications Deployment Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Proactive Notifications Deployment Helper${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for confirmation
confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 1
    fi
    return 0
}

# Function to check environment variable
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}✗ $1 is not set${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 is set${NC}"
        return 0
    fi
}

# ============================================
# Step 1: Environment Check
# ============================================
echo -e "${YELLOW}Step 1: Checking environment...${NC}"

# Check for required tools
echo "Checking required tools..."
MISSING_TOOLS=()

if ! command_exists "node"; then
    MISSING_TOOLS+=("node")
fi

if ! command_exists "npm"; then
    MISSING_TOOLS+=("npm")
fi

if ! command_exists "gcloud"; then
    echo -e "${YELLOW}Warning: gcloud CLI not found (needed for Cloud Scheduler)${NC}"
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo -e "${RED}Missing required tools: ${MISSING_TOOLS[*]}${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required tools found${NC}"
echo ""

# ============================================
# Step 2: Environment Variables
# ============================================
echo -e "${YELLOW}Step 2: Checking environment variables...${NC}"

# Load .env.local if it exists
if [ -f "apps/web/.env.local" ]; then
    echo "Loading apps/web/.env.local..."
    export $(cat apps/web/.env.local | grep -v '^#' | xargs)
fi

# Check required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "CRON_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! check_env_var "$var"; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}  - $var${NC}"
    done
    echo ""
    echo "Please set these in your .env.local file or environment"
    exit 1
fi

echo -e "${GREEN}✓ All required environment variables are set${NC}"
echo ""

# ============================================
# Step 3: Database Migration
# ============================================
echo -e "${YELLOW}Step 3: Database Migration${NC}"

if confirm "Do you want to run the database migration?"; then
    echo "Opening migration file for review..."
    echo -e "${BLUE}Migration file: apps/web/supabase/migrations/20250113_proactive_notifications.sql${NC}"
    echo ""
    echo "Please run this migration in your Supabase SQL Editor:"
    echo "1. Go to https://app.supabase.com"
    echo "2. Select your project"
    echo "3. Go to SQL Editor"
    echo "4. Paste the contents of the migration file"
    echo "5. Click 'Run'"
    echo ""
    read -p "Press Enter when migration is complete..."
fi
echo ""

# ============================================
# Step 4: Install Dependencies
# ============================================
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"

cd apps/web
npm install
cd ../..

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ============================================
# Step 5: Build Application
# ============================================
echo -e "${YELLOW}Step 5: Building application...${NC}"

if confirm "Do you want to build the application?"; then
    cd apps/web
    npm run build
    cd ../..
    echo -e "${GREEN}✓ Build complete${NC}"
fi
echo ""

# ============================================
# Step 6: Google Cloud Scheduler Setup
# ============================================
echo -e "${YELLOW}Step 6: Google Cloud Scheduler Setup${NC}"

if command_exists "gcloud"; then
    if confirm "Do you want to set up Google Cloud Scheduler?"; then
        # Check for required GCP variables
        if [ -z "$GCP_PROJECT_ID" ]; then
            read -p "Enter your GCP Project ID: " GCP_PROJECT_ID
            export GCP_PROJECT_ID
        fi
        
        if [ -z "$DEPLOYMENT_DOMAIN" ]; then
            read -p "Enter your deployment domain (e.g., your-app.com): " DEPLOYMENT_DOMAIN
            export DEPLOYMENT_DOMAIN
        fi
        
        # Run the Cloud Scheduler setup script
        chmod +x scripts/setup-cloud-scheduler.sh
        ./scripts/setup-cloud-scheduler.sh
    fi
else
    echo -e "${YELLOW}Skipping Cloud Scheduler setup (gcloud not installed)${NC}"
    echo "You can run this later with: ./scripts/setup-cloud-scheduler.sh"
fi
echo ""

# ============================================
# Step 7: Test Endpoints
# ============================================
echo -e "${YELLOW}Step 7: Testing Endpoints${NC}"

if [ ! -z "$DEPLOYMENT_DOMAIN" ] && [ ! -z "$CRON_SECRET" ]; then
    if confirm "Do you want to test the cron endpoints?"; then
        echo "Testing rule evaluation endpoint..."
        curl -X POST "https://${DEPLOYMENT_DOMAIN}/api/cron/evaluate-rules" \
            -H "x-cron-secret: ${CRON_SECRET}" \
            -H "Content-Type: application/json" \
            -d '{}' \
            -w "\nHTTP Status: %{http_code}\n"
        
        echo ""
        echo "Testing notification processing endpoint..."
        curl -X POST "https://${DEPLOYMENT_DOMAIN}/api/cron/process-notifications" \
            -H "x-cron-secret: ${CRON_SECRET}" \
            -H "Content-Type: application/json" \
            -d '{}' \
            -w "\nHTTP Status: %{http_code}\n"
    fi
fi
echo ""

# ============================================
# Deployment Summary
# ============================================
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Deployment Preparation Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the DEPLOYMENT_CHECKLIST.md for detailed steps"
echo "2. Deploy your application to your hosting platform"
echo "3. Monitor the Cloud Scheduler jobs"
echo "4. Test notifications with a real user account"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View jobs:     gcloud scheduler jobs list --location=us-central1"
echo "  View logs:     gcloud logging read 'resource.type=cloud_scheduler_job'"
echo "  Test locally:  npm run dev"
echo ""
echo -e "${GREEN}Good luck with your deployment!${NC}"