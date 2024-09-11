#!/bin/bash

echo "Starting Docker cleanup and ECS agent disable process..."

# Stop all running containers
echo "Stopping all running containers..."
sudo docker stop $(sudo docker ps -aq)

# Remove all containers
echo "Removing all containers..."
sudo docker rm $(sudo docker ps -aq)

# Remove all unused images
echo "Removing all unused images..."
sudo docker image prune -a -f

# Remove all unused volumes
echo "Removing all unused volumes..."
sudo docker volume prune -f

# Remove all unused networks
echo "Removing all unused networks..."
sudo docker network prune -f

# Stop the ECS agent
echo "Stopping the ECS agent..."
sudo systemctl stop ecs

# Disable ECS agent from starting on boot
echo "Disabling ECS agent from starting on boot..."
sudo systemctl disable ecs

echo "Cleanup complete. ECS agent has been disabled."