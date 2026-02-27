# Deployment Guide: GitHub & AWS EC2

## Step 1: GitHub Deployment

### 1.1 Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click **New repository**
3. Fill in:
   - Repository name: `hostel-management`
   - Description: `Comprehensive hostel management system with React, Express, and MongoDB`
   - Visibility: Public or Private (your choice)
4. **Do NOT** initialize with README (we have one)
5. Click **Create repository**

### 1.2 Initialize Git Locally

```bash
cd "c:\Users\Aman\OneDrive\图片\HOSTEL MANAGEMENT - SKILL LAB"
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 1.3 Add Files and Commit

```bash
git add .
git commit -m "Initial commit: Full hostel management system with complaints, leaves, announcements"
```

### 1.4 Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hostel-management.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: AWS EC2 Deployment

### 2.1 Create EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **EC2 Dashboard**
3. Click **Launch Instances**
4. Configure:
   - **Name:** `hostel-management-server`
   - **AMI:** Ubuntu Server 20.04 LTS (t2.micro - free tier eligible)
   - **Instance Type:** t2.micro or larger
   - **Key Pair:** Create or select existing (save `.pem` file securely)
   - **Network Settings:**
     - Allow SSH (port 22)
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
5. Click **Launch Instance**

### 2.2 Get EC2 Details

- Note the **Public IPv4 address** (e.g., `54.123.456.789`)
- Download your `.pem` key file

### 2.3 Connect to EC2 via SSH

**Windows (PowerShell):**
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

**Alternative using PuTTY:**
- Convert `.pem` to `.ppk` using PuTTYgen
- Use PuTTY to connect

### 2.4 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.5 Install Docker and Docker Compose

```bash
# Install Docker
sudo apt install -y docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

### 2.6 Install Git

```bash
sudo apt install -y git
```

### 2.7 Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/hostel-management.git
cd hostel-management
```

### 2.8 Create Environment File

```bash
nano .env
```

Add the following content:
```env
PORT=5000
MONGODB_URI=mongodb://mongo:27017/hostel
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=production
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 2.9 Start Application

```bash
docker-compose up -d
```

### 2.10 Verify Deployment

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Test application
curl http://localhost
```

### 2.11 Access Application

Open your browser and go to:
```
http://YOUR_EC2_IP
```

Replace `YOUR_EC2_IP` with your actual EC2 instance's public IP address.

---

## Step 3: Domain Configuration (Optional)

### Using Route 53 (AWS DNS)

1. Go to **Route 53** in AWS Console
2. Create or select your hosted zone
3. Create A record pointing to EC2 public IP
4. Update DNS records

### Using External DNS Provider

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add DNS A record pointing to EC2 IP:
   ```
   A record: yourdomain.com -> YOUR_EC2_IP
   A record: www.yourdomain.com -> YOUR_EC2_IP
   ```

---

## Step 4: SSL/HTTPS Setup (Recommended)

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf with SSL configuration
```

---

## Step 5: Monitoring and Maintenance

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

### Stop Services

```bash
docker-compose down
```

### Update Application

```bash
cd hostel-management
git pull origin main
docker-compose up -d --build
```

---

## Demo Accounts for Testing

### Admin
- Email: `admin@hostel.com`
- Password: `admin123`

### Student
- Email: `student@hostel.com`
- Password: `student123`

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 80
sudo lsof -i :80

# Kill process
sudo kill -9 PID
```

### Container Not Starting

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Database Connection Issues

```bash
# Verify MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb
```

### Permission Denied Errors

```bash
# Make sure user is in docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

---

## Performance Optimization

### For High Traffic

1. **Use RDS for Database**
   - Replace local MongoDB with AWS RDS for MongoDB/Atlas
   - Update `MONGODB_URI` in `.env`

2. **Use CloudFront CDN**
   - Serve static assets through CloudFront
   - Point to application

3. **Load Balancing**
   - Use AWS ALB (Application Load Balancer)
   - Run multiple container instances

4. **Auto Scaling**
   - Use ECS or EKS with auto-scaling groups

---

## Security Best Practices

✅ **Implemented:**
- JWT authentication
- Password hashing (bcrypt)
- Environment variables for secrets
- CORS configuration
- Input validation

✅ **Additional Steps:**
- Change JWT_SECRET to a strong value
- Use AWS Secrets Manager for sensitive data
- Enable security groups for specific IPs
- Regular security updates
- Enable CloudWatch monitoring
- Use AWS WAF for protection

---

## Cost Estimation (AWS)

| Service | Tier | Cost/Month |
|---------|------|-----------|
| EC2 (t2.micro) | Free Tier | $0 |
| RDS MongoDB | Free Tier | $0 |
| Data Transfer | <1GB | <$1 |
| **Total** | | **~$0-5** |

*Cost varies by region and usage*

---

## Support & Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Guides](https://guides.github.com)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)

---

**Last Updated:** February 2026
