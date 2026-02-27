# Hostel Management System - Deployment Guide

## Prerequisites
- AWS Account
- EC2 Instance (Ubuntu 22.04)
- Key pair (.pem file)

## Quick Deployment Steps

### 1. Launch EC2 Instance
- **AMI:** Ubuntu Server 22.04 LTS
- **Type:** t2.micro
- **Security Group:** Allow ports 22 (SSH) and 80 (HTTP)

### 2. Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 3. Install Docker & Docker Compose
```bash
# Install Docker
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
```

### 4. Transfer Project Files
From your local machine:
```bash
scp -i your-key.pem -r * ubuntu@your-ec2-ip:~/hostel-app/
```

### 5. Run Application
On EC2:
```bash
cd ~/hostel-app
chmod +x deploy.sh
./deploy.sh
```

### 6. Access Application
Open browser: `http://your-ec2-public-ip`

## Application Architecture

```
┌─────────────────┐
│   Internet      │
└────────┬────────┘
         │
    ┌────▼────┐
    │  EC2    │
    │ Port 80 │
    └────┬────┘
         │
    ┌────▼──────────────────────┐
    │  Docker Compose           │
    │  ┌──────────────────────┐ │
    │  │ Nginx (Port 80)      │ │
    │  └──────┬───────────────┘ │
    │         │                  │
    │  ┌──────▼───────────────┐ │
    │  │ Backend (Port 5000)  │ │
    │  └──────┬───────────────┘ │
    │         │                  │
    │  ┌──────▼───────────────┐ │
    │  │ MongoDB (Port 27017) │ │
    │  └──────────────────────┘ │
    └───────────────────────────┘
```

## Useful Commands

### View Logs
```bash
docker-compose logs -f
docker-compose logs backend
docker-compose logs nginx
```

### Restart Application
```bash
docker-compose restart
```

### Stop Application
```bash
docker-compose down
```

### Update Application
```bash
docker-compose down
docker-compose up -d --build
```

### Check Container Status
```bash
docker ps
docker stats
```

## Troubleshooting

### Port 80 Already in Use
```bash
sudo netstat -tulpn | grep :80
sudo systemctl stop apache2  # if Apache is running
```

### Permission Denied
```bash
sudo usermod -aG docker $USER
# Logout and login again
```

### Containers Not Starting
```bash
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### Check Container Logs
```bash
docker logs backend
docker logs nginx
docker logs mongo
```

## Security Best Practices

1. **SSH Access:** Limit to your IP only
2. **Update Security Group:** Only allow necessary ports
3. **Use HTTPS:** Set up SSL certificate with Let's Encrypt
4. **MongoDB:** Already secured (not exposed publicly)
5. **Regular Updates:** Keep system and Docker updated

## Optional: Set Up Domain & SSL

### 1. Point Domain to EC2
Add A Record: `your-domain.com → EC2-Public-IP`

### 2. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### 3. Update nginx.conf
Replace `server_name` with your domain.

## Monitoring

### Check System Resources
```bash
htop
df -h
docker stats
```

### Application Health
```bash
curl http://localhost/
curl http://localhost/complaints
```

## Backup MongoDB Data

```bash
# Create backup
docker exec mongo mongodump --out /data/backup

# Copy backup to host
docker cp mongo:/data/backup ./mongo-backup

# Restore backup
docker exec mongo mongorestore /data/backup
```

## Support

For issues, check:
- Container logs: `docker-compose logs`
- EC2 system logs: `/var/log/syslog`
- Nginx logs: `docker logs nginx`
