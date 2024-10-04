#!/bin/bash
set -e

# Function to restore the database
restore_db() {
    BACKUP_FILE="/backups/your_backup_file.sql"
    if [ -f "$BACKUP_FILE" ]; then
        echo "Restoring database from backup..."
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$BACKUP_FILE"
        echo "Database restored successfully."
    else
        echo "Backup file not found. Skipping restore."
    fi
}

# If the database is empty (first run), restore from backup
if [ -z "$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\dt' | grep -v 'Did not find any relations.')" ]; then
    restore_db
else
    echo "Database is not empty. Skipping restore."
fi

echo "Starting database initialization"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO
    \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mjw') THEN
            CREATE DATABASE mjw;
        END IF;
    END
    \$\$;

    -- Create the rate_service user if it doesn't exist
    DO
    \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'rate_service') THEN
            CREATE USER rate_service WITH PASSWORD 'p_WyfqKq3.';
        END IF;
    END
    \$\$;

    -- Grant privileges to rate_service user on both databases
    GRANT ALL PRIVILEGES ON DATABASE mjw TO rate_service;
EOSQL

echo "Database initialization complete"