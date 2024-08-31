#!/bin/bash
set -e

echo "Starting database initialization"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create both databases if they don't exist
    SELECT 'CREATE DATABASE mjw'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mjw')\gexec

    SELECT 'CREATE DATABASE rate_service'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rate_service')\gexec

    -- Create the rate_service user if it doesn't exist
    DO
    \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'rate_service') THEN
            CREATE USER rate_service WITH PASSWORD '$DB_PASSWORD';
        END IF;
    END
    \$\$;

    -- Grant privileges to rate_service user on both databases
    GRANT ALL PRIVILEGES ON DATABASE mjw TO rate_service;
    GRANT ALL PRIVILEGES ON DATABASE rate_service TO rate_service;
EOSQL

echo "Database initialization complete"