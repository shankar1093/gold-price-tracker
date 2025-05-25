#!/bin/bash
set -e

echo "Starting database initialization for development environment"

# Function to restore the database
restore_db() {
    BACKUP_FILE="/docker-entrypoint-initdb.d/backup.sql"
    if [ -f "$BACKUP_FILE" ]; then
        echo "Restoring database from backup..."
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$BACKUP_FILE"
        echo "Database restored successfully."
    else
        echo "No backup file found at $BACKUP_FILE. Skipping restore."
    fi
}

# Check if we need to restore from backup
# Note: In development, we might want to always start fresh or restore from a known state
if [ "$RESTORE_FROM_BACKUP" = "true" ]; then
    restore_db
fi

# The main database 'mjw' is already created by POSTGRES_DB environment variable
# We just need to ensure the user exists and has proper permissions

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- The rate_service user is already created by POSTGRES_USER environment variable
    -- But let's ensure it has all necessary permissions
    
    -- Grant all privileges on the current database
    GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB" TO "$POSTGRES_USER";
    
    -- Grant privileges on the schema
    GRANT ALL ON SCHEMA public TO "$POSTGRES_USER";
    
    -- Grant privileges on all tables (current and future)
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$POSTGRES_USER";
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$POSTGRES_USER";
    
    -- Grant default privileges for future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$POSTGRES_USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$POSTGRES_USER";
    
    -- Create extensions that might be needed
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Log the completion
    \echo 'Database initialization completed successfully'
EOSQL

echo "Database initialization complete for development environment"