#!/bin/bash

echo "Resetting PostgreSQL data directory..."

# Check if postgres-data exists
if [ -d "/ecs/postgres-data" ]; then
    echo "Clearing contents of /ecs/postgres-data"
    # Remove contents of the directory (but not the directory itself)
    sudo find /ecs/postgres-data -mindepth 1 -delete
else
    echo "Creating /ecs/postgres-data directory"
    sudo mkdir -p /ecs/postgres-data
fi

# Set the correct ownership for the directory
sudo chown 999:999 /ecs/postgres-data

echo "PostgreSQL data directory has been reset."