#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Running migrations..."
python manage.py migrate

echo "Setting up cron job for gold_rate_update script..."
echo "0 9 * * * /usr/local/bin/python /app/scripts/gold_rate_update.py >> /var/log/cron.log 2>&1" > /etc/cron.d/gold_rate_update
chmod 0644 /etc/cron.d/gold_rate_update
crontab /etc/cron.d/gold_rate_update

# Start cron service
service cron start

echo "Starting Django server..."
exec "$@"