import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());

// Serve React build files
app.use(express.static(path.join(__dirname, 'dist')));

const JWT_SECRET = process.env.JWT_SECRET || "hostelops-secret-key-2026";

// MongoDB connection with error handling
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/hostelops";
mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

// Complaint Schema with priority
const ComplaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  roomNumber: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'closed', 'rejected'], default: 'pending' },
  assignedTo: { type: String },
  images: [{ type: String }],
  adminNotes: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);

// Leave Request Schema
const LeaveSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  destination: { type: String },
  contactNumber: { type: String },
  emergencyContact: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminRemarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Leave = mongoose.model("Leave", LeaveSchema);

// Announcement Schema
const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['general', 'urgent', 'event', 'maintenance'], default: 'general' },
  targetAudience: { type: String, enum: ['all', 'students', 'staff'], default: 'all' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model("Announcement", AnnouncementSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Root endpoint
app.get("/", (req, res) => {
  res.send("HostelOps Running - Production Ready");
});

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student'
    });

    await user.save();

    res.status(201).json({ 
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Submit complaint (Student only)
app.post("/complaint", authenticateToken, async (req, res) => {
  try {
    const { category, description, title, location, roomNumber, priority } = req.body;
    
    if (!category || !description || !title) {
      return res.status(400).json({ 
        error: "Category, title, and description are required" 
      });
    }

    if (category.trim().length === 0 || description.trim().length === 0 || title.trim().length === 0) {
      return res.status(400).json({ 
        error: "Fields cannot be empty" 
      });
    }

    const complaint = new Complaint({ 
      studentId: req.user.id,
      title,
      category, 
      description,
      location: location || '',
      roomNumber: roomNumber || '',
      priority: priority || 'medium'
    });
    
    await complaint.save();
    
    res.status(201).json({ 
      message: "Complaint submitted successfully",
      complaint 
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ 
      error: "Failed to submit complaint" 
    });
  }
});

// Get complaints (Students see their own, Admins see all)
app.get("/complaints", authenticateToken, async (req, res) => {
  try {
    let filter = {};
    
    // Students can only see their own complaints
    if (req.user.role === 'student') {
      filter.studentId = req.user.id;
    }
    
    const complaints = await Complaint.find(filter).populate('studentId', 'name email').sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ 
      error: "Failed to fetch complaints" 
    });
  }
});

// Update complaint status (Admin only)
app.put("/complaint/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, priority, assignedTo, adminNotes } = req.body;
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ 
        error: "Complaint not found" 
      });
    }

    if (status) {
      const validStatuses = ["pending", "in_progress", "resolved", "closed", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: "Invalid status" 
        });
      }
      complaint.status = status;
      if (status === 'resolved' || status === 'closed') {
        complaint.resolvedAt = new Date();
      }
    }

    if (priority) complaint.priority = priority;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (adminNotes) complaint.adminNotes = adminNotes;

    complaint.updatedAt = new Date();
    await complaint.save();
    res.json({ message: "Complaint updated", complaint });
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ 
      error: "Failed to update complaint" 
    });
  }
});

// Filter complaints (Admin can filter all, Students filter their own)
app.get("/complaints/filter", authenticateToken, async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    let filter = {};
    
    // Students can only see their own complaints
    if (req.user.role === 'student') {
      filter.userId = req.user.id;
    }
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const data = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    console.error("Error filtering complaints:", error);
    res.status(500).json({ 
      error: "Failed to filter complaints" 
    });
  }
});

// Get user profile
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Get statistics (Admin only)
// Statistics endpoint (Admin only)
app.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'pending' });
    const in_progress = await Complaint.countDocuments({ status: 'in_progress' });
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const urgent = await Complaint.countDocuments({ priority: 'urgent' });
    const high = await Complaint.countDocuments({ priority: 'high' });
    
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      complaints: { total, pending, in_progress, resolved, urgent, high },
      students: totalStudents,
      leaves: { total: totalLeaves, pending: pendingLeaves },
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Leave Request endpoints
// Submit leave request (Student only)
app.post("/leave", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, reason, destination, contactNumber, emergencyContact } = req.body;
    
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ error: "Start date, end date, and reason are required" });
    }

    const leave = new Leave({
      studentId: req.user.id,
      startDate,
      endDate,
      reason,
      destination,
      contactNumber,
      emergencyContact
    });

    await leave.save();
    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (error) {
    console.error("Error submitting leave:", error);
    res.status(500).json({ error: "Failed to submit leave request" });
  }
});

// Get leave requests
app.get("/leaves", authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter.studentId = req.user.id;
    }
    
    const leaves = await Leave.find(filter).populate('studentId', 'name email').sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

// Update leave status (Admin only)
app.put("/leave/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    if (status) leave.status = status;
    if (adminRemarks) leave.adminRemarks = adminRemarks;

    await leave.save();
    res.json({ message: "Leave request updated", leave });
  } catch (error) {
    console.error("Error updating leave:", error);
    res.status(500).json({ error: "Failed to update leave request" });
  }
});

// Announcement endpoints
// Create announcement (Admin only)
app.post("/announcement", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, message, category, targetAudience, expiresAt } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const announcement = new Announcement({
      title,
      message,
      category: category || 'general',
      targetAudience: targetAudience || 'all',
      createdBy: req.user.id,
      expiresAt
    });

    await announcement.save();
    res.status(201).json({ message: "Announcement created", announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// Get announcements
app.get("/announcements", authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      $or: [
        { expiresAt: { $gte: now } },
        { expiresAt: null }
      ]
    }).populate('createdBy', 'name').sort({ createdAt: -1 }).limit(20);
    
    res.json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// Delete announcement (Admin only)
app.delete("/announcement/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

// 404 handler - serve React app for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error" 
  });
});

// Seed demo accounts on startup
const seedDemoAccounts = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@hostel.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@hostel.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Demo admin account created: admin@hostel.com / admin123');
    }

    const studentExists = await User.findOne({ email: 'student@hostel.com' });
    if (!studentExists) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      await User.create({
        name: 'John Doe',
        email: 'student@hostel.com',
        password: hashedPassword,
        role: 'student'
      });
      console.log('Demo student account created: student@hostel.com / student123');
    }
  } catch (err) {
    console.error('Error seeding demo accounts:', err);
  }
};

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
  seedDemoAccounts();
});