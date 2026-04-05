#!/bin/bash
# deploy_static.sh
# Runs on EC2 at startup: waits for backend, builds static site,
# deploys to Cloudflare Pages, then stops this EC2 instance.
#
# Prerequisites on EC2:
#   - Node.js 20+ installed
#   - CLOUDFLARE_API_TOKEN stored in AWS SSM Parameter Store
#     at /mjw/cloudflare-api-token (SecureString)
#   - EC2 instance role with ec2:StopInstances + ssm:GetParameter permissions
#   - Docker containers running with backend at localhost:8000
#
# Trigger: add to crontab with @reboot so it runs on every EC2 start:
#   @reboot /home/ec2-user/gold-price-tracker/backend/mjw_services/scripts/deploy_static.sh >> /var/log/deploy-static.log 2>&1

set -euo pipefail

APP_DIR="/home/ec2-user/gold-price-tracker"
FRONTEND_DIR="$APP_DIR/frontend"
AWS_REGION="ap-south-1"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "=== Static site deploy started ==="

# ── 1. Wait for Django backend ──────────────────────────────────────────────
log "Waiting for backend to be ready..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:8000/gold_rate_admin/metal-rate/ > /dev/null 2>&1; then
        log "Backend ready after ${i} attempts"
        break
    fi
    if [ "$i" -eq 30 ]; then
        log "ERROR: Backend not ready after 5 minutes — aborting"
        exit 1
    fi
    sleep 10
done

# ── 2. Pull latest code ──────────────────────────────────────────────────────
log "Pulling latest code..."
cd "$APP_DIR"
git pull origin main

# ── 3. Build static export ───────────────────────────────────────────────────
log "Building static export..."
cd "$FRONTEND_DIR"
npm ci --prefer-offline
NODE_ENV=production STATIC_EXPORT=true BACKEND_URL=http://localhost:8000 npm run build:static
log "Static build complete — $(find out -name '*.html' | wc -l) HTML files generated"

# ── 4. Deploy to Cloudflare Pages ───────────────────────────────────────────
log "Fetching Cloudflare token from SSM..."
export CLOUDFLARE_API_TOKEN=$(aws ssm get-parameter \
    --name "/mjw/cloudflare-api-token" \
    --with-decryption \
    --region "$AWS_REGION" \
    --query "Parameter.Value" \
    --output text)

log "Deploying to Cloudflare Pages..."
npx wrangler pages deploy out --project-name mjw-website
log "Deploy complete"

# ── 5. Stop this EC2 instance ────────────────────────────────────────────────
log "Stopping EC2 instance..."
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
aws ec2 stop-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION"
log "=== Done — EC2 stop initiated ==="
