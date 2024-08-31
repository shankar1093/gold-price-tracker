#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Running migrations..."
python manage.py migrate

echo "Running gold_rate_update script..."
python scripts/gold_rate_update.py

echo "Starting Django server..."
exec "$@"