#!/bin/sh
# Load env vars (same pattern as run_gold_update.sh)
. /tmp/env_vars.sh

/usr/local/bin/python /app/scripts/instagram_sync.py >> /var/log/cron.log 2>&1
