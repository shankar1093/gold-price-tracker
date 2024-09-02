#!/bin/bash
set -e

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