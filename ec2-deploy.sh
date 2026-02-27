#!/bin/bash
# EC2 Deployment Script for HostelOps
# This script automates the deployment process on AWS EC2

set -e

echo "================================"
echo "HostelOps - EC2 Deployment Script"
echo "================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update System
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

# Step 2: Install Docker
echo -e "${YELLOW}[2/10] Installing Docker...${NC}"
sudo apt install -y docker.io docker-compose

# Step 3: Add user to docker group
echo -e "${YELLOW}[3/10] Configuring Docker permissions...${NC}"
sudo usermod -aG docker $USER
newgrp docker

# Step 4: Install Git
echo -e "${YELLOW}[4/10] Installing Git...${NC}"
sudo apt install -y git

# Step 5: Install Node.js and npm (optional, for manual deployments)
echo -e "${YELLOW}[5/10] Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Step 6: Clone repository
echo -e "${YELLOW}[6/10] Cloning repository...${NC}"
if [ -z "$GITHUB_REPO" ]; then
    read -p "Enter GitHub repository URL: " GITHUB_REPO
fi
git clone $GITHUB_REPO hostel-management
cd hostel-management

# Step 7: Create .env file
echo -e "${YELLOW}[7/10] Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://mongo:27017/hostel
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
    echo -e "${GREEN}Created .env file with secure JWT_SECRET${NC}"
else
    echo -e "${YELLOW}.env file already exists, skipping...${NC}"
fi

# Step 8: Build and start containers
echo -e "${YELLOW}[8/10] Building Docker containers...${NC}"
docker-compose up -d --build

# Step 9: Wait for services to start
echo -e "${YELLOW}[9/10] Waiting for services to initialize...${NC}"
sleep 10

# Step 10: Verify deployment
echo -e "${YELLOW}[10/10] Verifying deployment...${NC}"
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Summary${NC}"
echo -e "${GREEN}================================${NC}"
docker-compose ps
echo ""
echo -e "${GREEN}Checking application health...${NC}"
if curl -s http://localhost > /dev/null; then
    echo -e "${GREEN}✓ Application is running!${NC}"
else
    echo -e "${RED}✗ Application might not be responding${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Access your application at:"
echo "  http://$(hostname -I | awk '{print $1}')"
echo ""
echo "Demo Accounts:"
echo "  Admin: admin@hostel.com / admin123"
echo "  Student: student@hostel.com / student123"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
echo ""
