#!/bin/bash

# Hostel Management System - EC2 Deployment Script

echo "🚀 Starting deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Pull latest changes (if using git)
# git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images
echo "🗑️  Cleaning up old images..."
docker system prune -f

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build

# Check status
echo "✅ Checking container status..."
docker ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo "✨ Deployment complete!"
echo "🌐 Access your app at: http://$(curl -s ifconfig.me)"
