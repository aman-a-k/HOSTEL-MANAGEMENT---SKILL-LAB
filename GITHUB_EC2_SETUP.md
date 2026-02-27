# GitHub & EC2 Deployment Setup Guide

## Quick Setup Instructions

### Option A: Using Command Line (Recommended)

#### Step 1: Create GitHub Repository

Go to [GitHub.com](https://github.com/new) and create a new repository:
- **Repository name:** `hostel-management`
- **Description:** `Comprehensive hostel management system for college hostels`
- **Visibility:** Public (recommended for portfolio) or Private
- **Do NOT** initialize with README/gitignore (we have them)

#### Step 2: Push to GitHub

In your project directory, run:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hostel-management.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Note:** You'll be prompted for authentication. Use:
- **Username:** Your GitHub username
- **Password:** A Personal Access Token (see below)

#### Step 3: Create Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✓ repo (full control)
   - ✓ workflow
   - ✓ admin:repo_hook
4. Copy the token and use it as your password when pushing

---

### Option B: Using GitHub Desktop (Easier)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. Click "Create a New Repository"
4. Fill in:
   - Name: `hostel-management`
   - Local Path: your project directory
5. Click "Create Repository"
6. Click "Publish Repository"
7. Make it public/private as desired
8. Click "Publish Repository"

---

## EC2 Deployment

### Step 1: Create EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com/ec2/)
2. Click **Launch Instances**
3. Choose **Ubuntu Server 20.04 LTS** (Free tier eligible)
4. Select **t2.micro** instance type
5. Configure security group (allow SSH, HTTP, HTTPS):
   ```
   SSH (22) - from your IP
   HTTP (80) - from anywhere (0.0.0.0/0)
   HTTPS (443) - from anywhere (0.0.0.0/0)
   ```
6. Create or select a **Key Pair** (download the `.pem` file)
7. Click **Launch**

### Step 2: Connect to EC2

**Windows (PowerShell):**
```bash
# Set key permissions
icacls "your-key.pem" /inheritance:r /grant:r "%username%:F"

# Connect
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

**Mac/Linux:**
```bash
chmod 600 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

Replace `YOUR_EC2_IP` with your instance's public IP address.

### Step 3: Automated Deployment

Once connected to your EC2 instance, run:

```bash
# Download and run deployment script
wget https://raw.githubusercontent.com/YOUR_USERNAME/hostel-management/main/ec2-deploy.sh
chmod +x ec2-deploy.sh
./ec2-deploy.sh
```

When prompted, enter your GitHub repository URL:
```
https://github.com/YOUR_USERNAME/hostel-management.git
```

### Step 4: Manual Deployment (if automation fails)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker

# Install Git
sudo apt install -y git

# Clone repository
git clone https://github.com/YOUR_USERNAME/hostel-management.git
cd hostel-management

# Create environment file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://mongo:27017/hostel
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Start application
docker-compose up -d --build

# Verify
docker-compose ps
```

### Step 5: Access Your Application

Open your browser and go to:
```
http://YOUR_EC2_IP
```

You should see the login page. Use demo credentials:
- **Admin:** admin@hostel.com / admin123
- **Student:** student@hostel.com / student123

---

## GitHub Actions Setup (Continuous Deployment)

### Step 1: Add Secrets to GitHub

1. Go to your repository on GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secrets:

**EC2_HOST**
- Value: Your EC2 instance's public IP

**EC2_SSH_KEY**
- Value: Content of your `.pem` file (copy the entire file)

### Step 2: How It Works

Every time you push to `main` branch:
1. GitHub Actions automatically builds the project
2. Tests that the build is successful
3. Deploys to your EC2 instance
4. Updates the running Docker containers

Just push your changes:
```bash
git add .
git commit -m "Your message"
git push origin main
```

---

## Monitoring Your Application

### View Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f mongodb
```

### Restart Services

```bash
docker-compose restart
```

### Stop Application

```bash
docker-compose down
```

### Update from GitHub

```bash
git pull origin main
docker-compose up -d --build
```

---

## Troubleshooting

### Can't connect to EC2

```bash
# Check your security group allows SSH from your IP
# Check that .pem file has correct permissions:
icacls "your-key.pem" /inheritance:r /grant:r "%username%:F"
```

### Application not loading

```bash
# Check containers are running
docker-compose ps

# Check logs
docker-compose logs

# Restart
docker-compose restart
```

### Permission denied when deploying

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy to EC2
3. **Setup Domain Name** (optional)
   - Use Route 53 or external DNS provider
   - Point to your EC2 IP
4. **Setup SSL Certificate** (optional)
   - Use Let's Encrypt for free HTTPS
5. **Setup Monitoring** (optional)
   - CloudWatch, Datadog, or New Relic

---

## Useful Commands

```bash
# Check application status
curl http://YOUR_EC2_IP

# Check Docker containers
docker ps

# View application logs
tail -f docker-compose.log

# SSH into running container
docker exec -it hostel-web sh

# Backup database
docker exec hostel-mongo mongodump --out /backup

# Check disk space
df -h

# Check memory usage
free -h
```

---

## Security Reminders

✅ **Change These:**
- JWT_SECRET in .env (auto-generated on deployment)
- Database admin credentials
- Default demo accounts

✅ **Recommended:**
- Enable AWS CloudTrail logging
- Use SSL certificates (Let's Encrypt)
- Set up daily backups
- Enable EC2 termination protection
- Use Security Groups to restrict access

---

## Support

For issues:
1. Check [Deployment Guide](./DEPLOYMENT_GUIDE.md)
2. Review Docker logs: `docker-compose logs`
3. Check GitHub Actions for CI/CD logs
4. Create an issue on GitHub repository

---

**Last Updated:** February 2026
