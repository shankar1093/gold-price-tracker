#!/bin/sh

# Load env vars
. /tmp/env_vars.sh

# Run the Python script
/usr/local/bin/python /app/scripts/gold_rate_update.py >> /var/log/cron.log 2>&1