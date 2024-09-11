#!/bin/bash

echo "Starting ECS agent enable process..."

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