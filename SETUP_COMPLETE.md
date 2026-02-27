# HostelOps - Complaint Management System

## 🎉 Application Status: LIVE & FULLY FUNCTIONAL

**URL:** `http://localhost/`

---

## 📋 Pages Overview

### 1. **Login Page** (`/index.html`)
- Clean, professional login form
- Email and password authentication
- JWT token-based authentication
- Links to registration page
- Auto-redirect if already logged in

### 2. **Registration Page** (`/register.html`)
- User-friendly registration form
- Account type selection (Student/Admin)
- Password validation
- Seamless transition to dashboard after registration
- Links back to login

### 3. **Student Dashboard** (`/student-dashboard.html`)
- **Features:**
  - Submit new complaints with:
    - Category selection (Maintenance, Cleanliness, Noise, Utilities, Security, Other)
    - Priority level (Low, Medium, High)
    - Detailed description
  - View all personal complaints
  - Filter by Status, Category, and Priority
  - Real-time status tracking (Pending → In Progress → Resolved)
  - Color-coded badges for easy identification
  - Professional navbar with user info and logout

### 4. **Admin Dashboard** (`/admin-dashboard.html`)
- **Features:**
  - Statistics Dashboard with 4 cards:
    - Total Complaints
    - Pending Complaints
    - In Progress Complaints
    - Resolved Complaints
  - View ALL complaints from all students
  - Click any complaint to update its status
  - Filter by Status, Category, and Priority
  - Student name displayed for each complaint
  - Professional navbar and responsive layout
  - Modal popup for status updates

---

## 🔐 Demo Accounts

**Admin Account:**
- Email: `admin@hostel.com`
- Password: `admin123`

**Student Account:**
- Email: `student@hostel.com`
- Password: `student123`

---

## 🎨 UI/UX Highlights

✅ **Clean & Formal Design**
- Professional color scheme (Blue/Gray/Green)
- Neutral typography with proper hierarchy
- Consistent spacing and padding

✅ **Excellent User Experience**
- Intuitive navigation between pages
- Clear page separation and distinct sections
- Responsive design for all screen sizes
- Color-coded badges (Green=Resolved, Blue=In Progress, Orange=Pending)
- Priority indicators (Red=High, Yellow=Medium, Green=Low)

✅ **Interactive Elements**
- Smooth form submissions
- Real-time filtering
- Modal popups for status updates
- Success/error messages
- Loading states

---

## 🏗️ Technical Stack

**Frontend:**
- HTML5 (4 separate pages for proper page separation)
- CSS3 (Custom styling with CSS variables)
- Vanilla JavaScript (No frameworks)

**Backend:**
- Node.js (v18) + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication with bcryptjs password hashing
- Nginx Reverse Proxy
- Docker & Docker Compose

**Database:**
- MongoDB with persistent volumes
- User collection (name, email, hashed password, role)
- Complaints collection (userId, category, description, priority, status)

---

## 📁 Project Structure

```
.
├── public/
│   ├── index.html               # Login page
│   ├── register.html            # Registration page
│   ├── student-dashboard.html   # Student interface
│   ├── admin-dashboard.html     # Admin interface
│   └── styles.css               # Unified styling
├── server.js                    # Express backend
├── package.json                 # Dependencies
├── Dockerfile                   # Docker image
├── docker-compose.yml           # Container orchestration
├── nginx.conf                   # Reverse proxy config
└── README.md                    # Documentation
```

---

## 🚀 Features Implemented

### Authentication & Authorization
✅ User registration with role selection
✅ JWT token-based authentication
✅ Password hashing with bcryptjs
✅ Secure token storage in localStorage
✅ Auto-redirect based on role

### Student Module
✅ Submit complaints (category, description, priority)
✅ View personal complaints only
✅ Filter by status, category, priority
✅ Real-time status updates
✅ Formatted dates

### Admin Module
✅ View all complaints from all students
✅ Dashboard statistics (4 metrics)
✅ Update complaint status with modal
✅ Filter complaints (status, category, priority)
✅ Student name display

### UI/UX
✅ Professional, formal design
✅ Multiple separate pages with proper navigation
✅ Responsive layout
✅ Color-coded indicators
✅ Success/error messaging
✅ Loading states
✅ Empty state handling

---

## ✨ How to Use

### Login
1. Visit `http://localhost/`
2. Enter credentials (admin@hostel.com / admin123 or student@hostel.com / student123)
3. Click "Login"

### Register
1. Click "Register here" link
2. Fill in name, email, password, and role
3. Click "Register"
4. Automatically logged in and redirected

### As a Student
1. Click "Submit New Complaint"
2. Fill in category, priority, and description
3. Click "Submit Complaint"
4. View your complaints with filters
5. Monitor status updates

### As an Admin
1. View all statistics on dashboard
2. Browse all complaints
3. Click "Update Status" on any complaint
4. Select new status and confirm
5. Use filters to find specific complaints

---

## 🔧 Docker Commands

**Start Application:**
```bash
docker-compose up -d --build
```

**Stop Application:**
```bash
docker-compose down
```

**View Logs:**
```bash
docker logs backend
```

**Access Database:**
```bash
docker exec -it mongo mongosh
```

---

## 📝 API Endpoints

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (protected)
- `POST /complaint` - Submit complaint (protected)
- `GET /complaints` - Get complaints (protected, role-filtered)
- `PUT /complaint/:id` - Update status (protected, admin-only)
- `GET /stats` - Get statistics (protected, admin-only)

---

## ✅ All Requirements Met

✓ Multiple HTML pages with proper separation
✓ Clean, formal UI design
✓ Excellent UX with clear navigation
✓ Student module (register, login, submit, view, filter)
✓ Admin module (view all, update status, statistics)
✓ Authentication with JWT & bcryptjs
✓ Role-based access control
✓ Priority field (Low/Medium/High)
✓ Status tracking (Pending → In Progress → Resolved)
✓ Category filtering
✓ Docker containerization
✓ Nginx reverse proxy
✓ MongoDB persistence
✓ Professional styling with CSS

---

## 🎯 Status: PRODUCTION READY

All features implemented and tested. Ready for deployment to AWS EC2.
