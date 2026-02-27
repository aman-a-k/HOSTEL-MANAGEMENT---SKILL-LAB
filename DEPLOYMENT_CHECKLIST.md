# Complete Deployment Checklist

## Phase 1: GitHub Setup ✓

### Prerequisites
- [ ] GitHub account created
- [ ] Git installed on local machine
- [ ] Repository URL noted

### Steps
- [x] Git repository initialized locally
- [x] All files added to git (`.gitignore` created)
- [x] Initial commit created with all project files
- [ ] Create new repository on GitHub.com
- [ ] Add remote origin: `git remote add origin https://github.com/USERNAME/hostel-management.git`
- [ ] Push to main branch: `git push -u origin main`
- [ ] Verify all files appear on GitHub

### Files Ready for GitHub
```
✓ src/ - React components (LoginPage, RegisterPage, StudentDashboard, AdminDashboard)
✓ public/ - Static assets
✓ server.js - Express backend with all 15 API endpoints
✓ vite.config.js - Frontend build configuration
✓ package.json - Dependencies for frontend
✓ docker-compose.yml - Container orchestration
✓ Dockerfile - Application container
✓ nginx.conf - Reverse proxy configuration
✓ .gitignore - Git ignore rules
✓ .env.example - Environment template
✓ README.md - Project documentation
✓ DEPLOYMENT_GUIDE.md - Detailed deployment instructions
✓ GITHUB_EC2_SETUP.md - Quick setup guide
✓ ec2-deploy.sh - Automated EC2 deployment
✓ .github/workflows/deploy.yml - CI/CD pipeline
```

---

## Phase 2: AWS EC2 Setup

### Prerequisites
- [ ] AWS account with credit card
- [ ] EC2 access enabled
- [ ] Key pair created and downloaded

### AWS Console Steps
- [ ] Navigate to EC2 Dashboard
- [ ] Click "Launch Instances"
- [ ] Select "Ubuntu Server 20.04 LTS" (Free Tier eligible)
- [ ] Choose instance type: **t2.micro**
- [ ] Configure security group:
  - [ ] SSH (22) - from your IP
  - [ ] HTTP (80) - from 0.0.0.0/0
  - [ ] HTTPS (443) - from 0.0.0.0/0
- [ ] Review and Launch
- [ ] Create or select key pair (download `.pem` file)
- [ ] Launch instance
- [ ] Wait for "running" status
- [ ] Note the Public IPv4 address

### Information to Save
```
EC2 Instance Details:
├── Public IP: ________________________
├── Instance ID: ________________________
├── Key File: your-key.pem
└── Security Group: ________________________
```

---

## Phase 3: EC2 Configuration

### Initial SSH Connection
- [ ] Set key permissions (Windows):
  ```bash
  icacls "your-key.pem" /inheritance:r /grant:r "%username%:F"
  ```
- [ ] Connect via SSH:
  ```bash
  ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
  ```

### Automated Deployment (Recommended)
- [ ] Download deployment script:
  ```bash
  wget https://raw.githubusercontent.com/YOUR_USERNAME/hostel-management/main/ec2-deploy.sh
  ```
- [ ] Make it executable:
  ```bash
  chmod +x ec2-deploy.sh
  ```
- [ ] Run script:
  ```bash
  ./ec2-deploy.sh
  ```
- [ ] Enter GitHub repository URL when prompted
- [ ] Wait for completion

### Manual Deployment (if needed)
- [ ] Update system: `sudo apt update && sudo apt upgrade -y`
- [ ] Install Docker: `sudo apt install -y docker.io docker-compose`
- [ ] Configure Docker: `sudo usermod -aG docker $USER && newgrp docker`
- [ ] Install Git: `sudo apt install -y git`
- [ ] Clone repository: `git clone https://github.com/USERNAME/hostel-management.git`
- [ ] Create .env file with secure JWT_SECRET
- [ ] Start containers: `docker-compose up -d --build`
- [ ] Verify: `docker-compose ps`

---

## Phase 4: Application Verification

### Access Application
- [ ] Open browser
- [ ] Navigate to: `http://YOUR_EC2_IP`
- [ ] See login page

### Test Admin Account
- [ ] Email: `admin@hostel.com`
- [ ] Password: `admin123`
- [ ] Can access Admin Dashboard
- [ ] Can view Statistics
- [ ] Can manage Complaints
- [ ] Can manage Leave Requests
- [ ] Can create Announcements

### Test Student Account
- [ ] Email: `student@hostel.com`
- [ ] Password: `student123`
- [ ] Can submit complaints
- [ ] Can request leave
- [ ] Can view announcements
- [ ] Can track complaint status

### API Testing
```bash
# Test backend connectivity
curl http://YOUR_EC2_IP/api/health

# Check running containers
docker-compose ps

# View application logs
docker-compose logs -f
```

---

## Phase 5: GitHub Actions Setup (Optional but Recommended)

### Add Secrets to GitHub Repository
1. Go to: Settings → Secrets and variables → Actions
2. Add secret: `EC2_HOST`
   - Value: Your EC2 public IP address
3. Add secret: `EC2_SSH_KEY`
   - Value: Contents of your `.pem` file

### Verify CI/CD
- [ ] Workflow file exists at `.github/workflows/deploy.yml`
- [ ] Make a test commit and push to main
- [ ] Check "Actions" tab on GitHub
- [ ] Verify build succeeds
- [ ] Verify deployment to EC2 succeeds

---

## Phase 6: Domain Setup (Optional)

### Using Route 53 (AWS)
- [ ] Go to Route 53 console
- [ ] Create hosted zone for your domain
- [ ] Create A record pointing to EC2 IP
- [ ] Update domain registrar nameservers

### Using External DNS Provider
- [ ] Login to domain registrar (GoDaddy, Namecheap, etc.)
- [ ] Add A record:
  ```
  Host: @ (or yourdomain.com)
  Type: A
  Value: YOUR_EC2_IP
  TTL: 3600
  ```
- [ ] Add A record for www:
  ```
  Host: www
  Type: A
  Value: YOUR_EC2_IP
  TTL: 3600
  ```
- [ ] Wait 5-30 minutes for DNS propagation

---

## Phase 7: SSL/HTTPS Setup (Recommended)

### Using Let's Encrypt (Free)
```bash
# SSH into EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx configuration with SSL
```

### Verify HTTPS
- [ ] Open: `https://yourdomain.com` (should work)
- [ ] Check certificate: click padlock icon
- [ ] Verify it's from Let's Encrypt

---

## Phase 8: Production Hardening

### Security
- [ ] Change all default passwords
- [ ] Update JWT_SECRET in .env
- [ ] Enable Security Groups to restrict SSH
- [ ] Set NODE_ENV=production
- [ ] Disable verbose logging in production

### Database
- [ ] Backup MongoDB data
- [ ] Enable authentication in MongoDB
- [ ] Use strong database password

### Monitoring
- [ ] Setup CloudWatch alerts
- [ ] Monitor disk space: `df -h`
- [ ] Monitor memory: `free -h`
- [ ] Setup automated backups

### Updates
- [ ] Schedule regular apt updates: `sudo apt install unattended-upgrades`
- [ ] Regular security patches
- [ ] Docker image updates

---

## Phase 9: Documentation

### Repository Documentation
- [x] README.md - Project overview
- [x] DEPLOYMENT_GUIDE.md - Detailed instructions
- [x] GITHUB_EC2_SETUP.md - Quick start guide
- [x] This file - Deployment checklist

### Team Documentation
- [ ] Document your AWS credentials (secure vault)
- [ ] Document your EC2 IP address
- [ ] Document your domain name
- [ ] Document deployment process
- [ ] Document rollback procedure

---

## Maintenance Tasks

### Daily
- [ ] Monitor application logs: `docker-compose logs -f`
- [ ] Check system health: `df -h`, `free -h`
- [ ] Verify application accessibility

### Weekly
- [ ] Review error logs
- [ ] Check database size
- [ ] Verify backups completed
- [ ] Review GitHub Actions logs

### Monthly
- [ ] Security updates: `sudo apt update && sudo apt upgrade`
- [ ] Database optimization
- [ ] Performance review
- [ ] Backup verification

---

## Troubleshooting Guide

### Issue: Can't connect to EC2 via SSH

**Solution:**
```bash
# 1. Check key permissions
icacls "your-key.pem" /inheritance:r /grant:r "%username%:F"

# 2. Verify security group allows SSH from your IP
# 3. Check instance is in "running" state
# 4. Try with verbose output
ssh -v -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

### Issue: Application not accessible at http://YOUR_EC2_IP

**Solution:**
```bash
# 1. Check containers are running
docker-compose ps

# 2. Check logs
docker-compose logs

# 3. Verify port 80 is open in security group
# 4. Try accessing directly
curl http://localhost
```

### Issue: Database connection fails

**Solution:**
```bash
# 1. Check MongoDB container
docker-compose logs mongodb

# 2. Verify connection string in .env
# 3. Check MongoDB port (27017)
docker exec -it hostel-mongo mongo --eval "db.adminCommand('ping')"
```

### Issue: High CPU/Memory usage

**Solution:**
```bash
# Check which container is using resources
docker stats

# Restart containers
docker-compose restart

# Check logs for errors
docker-compose logs
```

---

## Deployment Statistics

### Timeline
- Initial Setup: ~5 minutes (automated script)
- GitHub Push: ~2 minutes
- EC2 Configuration: ~10 minutes
- First Deployment: ~15 minutes
- **Total: ~30 minutes**

### System Requirements
- **Minimum:** EC2 t2.micro (Free Tier)
- **Recommended:** EC2 t2.small (~$20/month)
- **High Traffic:** EC2 t2.medium or Auto-scaling

### Monthly Costs (AWS)
| Component | Free Tier | After 12 months |
|-----------|-----------|-----------------|
| EC2 (t2.micro) | Free | $9.50/month |
| Data Transfer | <1GB free | $0.12/GB |
| MongoDB Atlas | Free 512MB | $57/month+ |
| **Total** | **Free** | **~$70+** |

---

## Success Criteria

✅ **You've successfully deployed when:**

1. [ ] GitHub repository created and populated with code
2. [ ] EC2 instance running and accessible
3. [ ] Docker containers running: `docker-compose ps`
4. [ ] Application accessible at `http://YOUR_EC2_IP`
5. [ ] Can login with demo credentials
6. [ ] Admin dashboard shows statistics
7. [ ] Student can submit complaints
8. [ ] GitHub Actions CI/CD working (optional)
9. [ ] Domain pointing to EC2 IP (if configured)
10. [ ] HTTPS certificate installed (if configured)

---

## Quick Reference

```bash
# Connect to EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# View application logs
docker-compose logs -f

# Restart application
docker-compose restart

# Update from GitHub
git pull origin main
docker-compose up -d --build

# Check status
docker-compose ps

# Stop application
docker-compose down

# View resource usage
docker stats
```

---

## Support & Resources

- **AWS EC2:** https://docs.aws.amazon.com/ec2/
- **Docker:** https://docs.docker.com/
- **GitHub:** https://docs.github.com
- **MongoDB:** https://docs.mongodb.com/
- **Let's Encrypt:** https://letsencrypt.org/

---

## Sign-Off

- [ ] Deployment Date: _______________
- [ ] Deployed By: _______________
- [ ] Production URL: _______________
- [ ] Notes: _______________________________________________

---

**Last Updated:** February 2026
**Version:** 1.0.0
