#!/bin/bash

echo "Starting ECS agent enable process..."

# Ensure ECS always pulls latest images from ECR instead of using cached versions
echo "ECS_IMAGE_PULL_BEHAVIOR=always" | sudo tee -a /etc/ecs/ecs.config

# Enable ECS agent to start on boot
echo "Enabling ECS agent to start on boot..."
sudo systemctl enable ecs

# Start the ECS agent
echo "Starting the ECS agent..."
sudo systemctl start ecs

# Check the status of the ECS agent
echo "Checking ECS agent status..."
sudo systemctl status ecs

echo "ECS agent has been enabled and started."