# HostelOps: Production Deployment of a Containerized Complaint Management System

## 📋 Project Overview

A full-stack complaint management system for college hostels, featuring role-based access control, containerized deployment, and production-ready configurations.

## 🎯 Features Implemented

### Student Module
- ✅ User Registration with role selection
- ✅ Secure Login with JWT authentication
- ✅ Submit complaints with:
  - Category selection
  - Description
  - Priority (Low, Medium, High)
- ✅ View own complaint history
- ✅ Track complaint status
- ✅ Filter complaints by status, category, and priority

### Admin Module
- ✅ Secure Admin Login
- ✅ View all complaints from all students
- ✅ Update complaint status (Pending → In Progress → Resolved)
- ✅ Filter complaints by:
  - Status
  - Category
  - Priority
- ✅ View complaint submission details (student name, timestamp)

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (Student/Admin)
- ✅ Protected API endpoints
- ✅ Secure environment variables

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Internet (Port 80)            │
└────────────────┬────────────────────────┘
                 │
    ┌────────────▼────────────┐
    │   Nginx Reverse Proxy   │
    │    (Container: nginx)   │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │   Express.js Backend    │
    │   (Container: backend)  │
    │      - API Routes       │
    │      - Authentication   │
    │      - Business Logic   │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │   MongoDB Database      │
    │   (Container: mongo)    │
    │      - Users            │
    │      - Complaints       │
    └─────────────────────────┘
```

## 🐳 Containerization Details

### Backend Container
- **Base Image:** node:18
- **Exposed Port:** 5000
- **Environment Variables:**
  - `MONGO_URL`: MongoDB connection string
  - `JWT_SECRET`: Secret key for JWT tokens
  - `NODE_ENV`: Production environment
- **Restart Policy:** unless-stopped

### MongoDB Container
- **Image:** mongo:latest
- **Persistent Storage:** Volume mounted at `/data/db`
- **Network:** Internal only (not exposed publicly)
- **Restart Policy:** unless-stopped

### Nginx Container
- **Image:** nginx:latest
- **Exposed Port:** 80 (HTTP)
- **Configuration:** Custom nginx.conf for reverse proxy
- **Static Files:** Serves frontend from `/usr/share/nginx/html`
- **Restart Policy:** unless-stopped

## 🔐 Security Configuration

### Firewall Rules (EC2 Security Group)
```
Inbound Rules:
- Port 22  (SSH)    - Your IP only
- Port 80  (HTTP)   - 0.0.0.0/0 (public)
- Port 443 (HTTPS)  - 0.0.0.0/0 (optional, for SSL)

Outbound Rules:
- All traffic allowed
```

### Exposed Ports
- **Public:** 80 (Nginx)
- **Internal Only:** 5000 (Backend), 27017 (MongoDB)

### Authentication Flow
1. User registers/logs in
2. Backend validates credentials
3. JWT token generated and returned
4. Token stored in localStorage
5. Token sent with each API request
6. Backend verifies token before processing

## 📦 Technology Stack

### Backend
- Node.js (v18)
- Express.js (API server)
- MongoDB (Database)
- Mongoose (ODM)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT authentication)
- cors (Cross-origin requests)

### Frontend
- HTML5
- CSS3 (Custom styling)
- Vanilla JavaScript (No framework)

### DevOps
- Docker (Containerization)
- Docker Compose (Orchestration)
- Nginx (Reverse proxy)
- Ubuntu Server (EC2)

## 🚀 Deployment Instructions

### Local Development
```bash
# Install dependencies
npm install

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Production Deployment (EC2)

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro or larger
   - Security groups: SSH (22), HTTP (80)

2. **Install Docker**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

3. **Install Docker Compose**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

4. **Transfer Files**
```bash
# From local machine
scp -i your-key.pem -r * ubuntu@ec2-ip:~/hostel-app/
```

5. **Run Application**
```bash
cd ~/hostel-app
chmod +x deploy.sh
./deploy.sh
```

6. **Access Application**
   - Open browser: `http://your-ec2-public-ip`

## 📡 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)

### Complaints (Protected)
- `POST /complaint` - Submit complaint (Students)
- `GET /complaints` - Get complaints (filtered by role)
- `PUT /complaint/:id` - Update status (Admin only)
- `GET /complaints/filter` - Filter complaints
- `GET /stats` - Get statistics (Admin only)

### Request Flow Example
```
Client → Nginx (Port 80) → Backend (Port 5000) → MongoDB (Port 27017)
  ↓
JWT Token Verification
  ↓
Role-Based Authorization
  ↓
Database Operation
  ↓
Response JSON
```

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: 'student', 'admin'),
  createdAt: Date
}
```

### Complaints Collection
```javascript
{
  userId: ObjectId (ref: User),
  userName: String,
  category: String,
  description: String,
  priority: String (enum: 'Low', 'Medium', 'High'),
  status: String (enum: 'Pending', 'In Progress', 'Resolved'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the Application

### Create Admin Account
1. Open application
2. Click "Register here"
3. Fill form and select "Admin" role
4. Click Register

### Create Student Account
1. Click "Register here"
2. Fill form and select "Student" role
3. Click Register

### Student Workflow
1. Login as student
2. Submit complaint with category, priority, description
3. View your complaints
4. Filter by status/category/priority
5. Track complaint status

### Admin Workflow
1. Login as admin
2. View all complaints from all students
3. Filter complaints
4. Update complaint status
5. View statistics

## 🛠️ Maintenance Commands

### View Container Status
```bash
docker ps
docker stats
```

### View Logs
```bash
docker-compose logs backend
docker-compose logs nginx
docker-compose logs mongo
```

### Restart Services
```bash
docker-compose restart
```

### Update Application
```bash
docker-compose down
docker-compose up -d --build
```

### Backup Database
```bash
docker exec mongo mongodump --out /data/backup
docker cp mongo:/data/backup ./mongo-backup-$(date +%Y%m%d)
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
sudo netstat -tulpn | grep :80
sudo systemctl stop apache2
```

### Permission Denied
```bash
sudo usermod -aG docker $USER
# Logout and login again
```

### Authentication Issues
- Clear localStorage in browser
- Check JWT_SECRET environment variable
- Verify token expiration (24 hours)

### Database Connection Issues
- Check if mongo container is running
- Verify MONGO_URL environment variable
- Check container networking: `docker network inspect hostelmanagement-skilllab_default`

## 📈 Production Best Practices Implemented

1. ✅ **Environment Variables:** Externalized configuration
2. ✅ **Container Restart Policies:** Auto-restart on failure
3. ✅ **Volume Persistence:** MongoDB data persists across restarts
4. ✅ **Health Monitoring:** Container status checks
5. ✅ **Security:** JWT tokens, password hashing, role-based access
6. ✅ **Reverse Proxy:** Nginx for production routing
7. ✅ **Minimal Port Exposure:** Only port 80 public
8. ✅ **Error Handling:** Comprehensive try-catch blocks
9. ✅ **Input Validation:** Server-side validation for all inputs
10. ✅ **Logging:** Console logs for debugging

## 📝 Project Structure

```
hostel-management-system/
├── server.js              # Backend API server
├── package.json           # Node.js dependencies
├── Dockerfile             # Backend container configuration
├── docker-compose.yml     # Multi-container orchestration
├── nginx.conf             # Reverse proxy configuration
├── .dockerignore          # Docker build exclusions
├── deploy.sh              # Deployment automation script
├── DEPLOYMENT.md          # Deployment guide
├── README.md              # This file
└── public/
    └── index.html         # Frontend application
```

## 👥 User Roles & Permissions

| Feature | Student | Admin |
|---------|---------|-------|
| Register | ✅ | ✅ |
| Login | ✅ | ✅ |
| Submit Complaint | ✅ | ❌ |
| View Own Complaints | ✅ | N/A |
| View All Complaints | ❌ | ✅ |
| Update Status | ❌ | ✅ |
| Filter Complaints | ✅ | ✅ |
| View Statistics | ❌ | ✅ |

## 🔒 Security Considerations

1. **Passwords:** Hashed using bcrypt (salt rounds: 10)
2. **JWT Tokens:** 24-hour expiration
3. **CORS:** Enabled for API access
4. **MongoDB:** Not exposed publicly (internal network only)
5. **Environment Variables:** Sensitive data externalized
6. **Input Validation:** Server-side validation on all endpoints
7. **Role-Based Access:** Middleware enforces admin-only actions

## 📊 Monitoring & Logging

### Application Logs
```bash
# Real-time logs
docker-compose logs -f

# Backend logs only
docker logs backend -f

# Last 100 lines
docker logs backend --tail 100
```

### System Monitoring
```bash
# Container resource usage
docker stats

# Disk space
df -h

# System resources
htop
```

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack web development
- RESTful API design
- Authentication & Authorization
- Database design & ODM usage
- Container orchestration
- Reverse proxy configuration
- Production deployment
- DevOps best practices
- Security implementation
- Documentation skills

## 📞 Support

For issues or questions:
1. Check container logs
2. Verify environment variables
3. Review network configuration
4. Check firewall rules
5. Validate JWT tokens

## 📄 License

Educational project for DevOps learning purposes.

---

**Built with ❤️ for college hostel management**
