import { useState, useEffect } from 'react'

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [complaints, setComplaints] = useState([])
  const [leaves, setLeaves] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [stats, setStats] = useState({ complaints: {}, students: 0, leaves: {} })
  const [loading, setLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [updateData, setUpdateData] = useState({})
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    category: 'general',
    targetAudience: 'all',
    expiresAt: ''
  })
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'complaints') fetchComplaints()
    if (activeTab === 'dashboard' || activeTab === 'leaves') fetchLeaves()
    if (activeTab === 'dashboard') fetchStats()
    if (activeTab === 'announcements') fetchAnnouncements()
  }, [activeTab])

  const fetchStats = async () => {
    try {
      const response = await fetch('/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const response = await fetch('/complaints', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      setComplaints(data.complaints || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const response = await fetch('/leaves', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      setLeaves(data.leaves || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await fetch('/announcements', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      setAnnouncements(data.announcements || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleComplaintUpdate = async () => {
    try {
      const response = await fetch(`/complaint/${selectedComplaint._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) throw new Error('Failed to update complaint')

      setSelectedComplaint(null)
      setUpdateData({})
      await fetchComplaints()
      await fetchStats()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleLeaveUpdate = async () => {
    try {
      const response = await fetch(`/leave/${selectedLeave._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) throw new Error('Failed to update leave')

      setSelectedLeave(null)
      setUpdateData({})
      await fetchLeaves()
      await fetchStats()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(announcementForm)
      })

      if (!response.ok) throw new Error('Failed to create announcement')

      setAnnouncementForm({ title: '', message: '', category: 'general', targetAudience: 'all', expiresAt: '' })
      setShowAnnouncementForm(false)
      await fetchAnnouncements()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    
    try {
      await fetch(`/announcement/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      await fetchAnnouncements()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const categories = {
    room_maintenance: 'Room Maintenance',
    electrical: 'Electrical Issues',
    plumbing: 'Plumbing/Water',
    cleaning: 'Cleaning',
    furniture: 'Furniture',
    wifi: 'WiFi/Internet',
    food: 'Food/Mess',
    security: 'Security',
    noise: 'Noise Complaint',
    ac_heating: 'AC/Heating',
    other: 'Other'
  }

  const filteredComplaints = complaints.filter(c => {
    const statusMatch = filterStatus === 'all' || c.status === filterStatus
    const priorityMatch = filterPriority === 'all' || c.priority === filterPriority
    const categoryMatch = filterCategory === 'all' || c.category === filterCategory
    return statusMatch && priorityMatch && categoryMatch
  })

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getLeaveStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`${color} rounded-xl shadow-md p-6 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-sm text-gray-600 mt-2">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color === 'bg-blue-50' ? 'bg-blue-100' : color === 'bg-yellow-50' ? 'bg-yellow-100' : color === 'bg-green-50' ? 'bg-green-100' : color === 'bg-purple-50' ? 'bg-purple-100' : 'bg-gray-100'}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">HostelOps Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Admin User</p>
              <p className="font-semibold text-gray-900">{user.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-3 px-1 font-semibold transition ${activeTab === 'dashboard' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`pb-3 px-1 font-semibold transition ${activeTab === 'complaints' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Complaints
              </div>
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`pb-3 px-1 font-semibold transition ${activeTab === 'leaves' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Leave Requests
              </div>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`pb-3 px-1 font-semibold transition ${activeTab === 'announcements' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Announcements
              </div>
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-600 mt-2">Hostel management statistics and insights</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Complaints"
                value={stats.complaints?.total || 0}
                color="bg-blue-50"
                icon={<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <StatCard
                title="Pending"
                value={stats.complaints?.pending || 0}
                color="bg-yellow-50"
                icon={<svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                title="In Progress"
                value={stats.complaints?.in_progress || 0}
                color="bg-purple-50"
                icon={<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              />
              <StatCard
                title="Resolved"
                value={stats.complaints?.resolved || 0}
                color="bg-green-50"
                icon={<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Urgent Priority"
                value={stats.complaints?.urgent || 0}
                color="bg-red-50"
                icon={<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                trend="Needs immediate attention"
              />
              <StatCard
                title="Total Students"
                value={stats.students || 0}
                color="bg-indigo-50"
                icon={<svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              />
              <StatCard
                title="Pending Leaves"
                value={stats.leaves?.pending || 0}
                color="bg-orange-50"
                icon={<svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                trend="Awaiting approval"
              />
            </div>

            {/* Recent Complaints */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Complaints</h3>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {complaints.slice(0, 5).map((complaint) => (
                  <div key={complaint._id} className="p-4 border-b border-gray-200 last:border-0 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{complaint.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Student: {complaint.studentId?.name || 'N/A'} • Room: {complaint.roomNumber || 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(complaint.status)}`}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Complaints Management Tab */}
        {activeTab === 'complaints' && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Complaints Management</h2>
              <p className="text-gray-600 mt-2">View and manage all hostel complaints</p>
            </div>

            <div className="mb-6 flex gap-4 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="all">All Categories</option>
                {Object.entries(categories).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>

              <button
                onClick={fetchComplaints}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg">No complaints found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{complaint.title}</h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          <span><span className="font-medium">Student:</span> {complaint.studentId?.name || 'N/A'}</span>
                          <span><span className="font-medium">Category:</span> {categories[complaint.category] || complaint.category}</span>
                          {complaint.roomNumber && <span><span className="font-medium">Room:</span> {complaint.roomNumber}</span>}
                          {complaint.location && <span><span className="font-medium">Location:</span> {complaint.location}</span>}
                        </div>
                        <p className="text-gray-700 mt-3">{complaint.description}</p>
                        {complaint.assignedTo && (
                          <p className="text-sm text-blue-600 mt-2">
                            <span className="font-medium">Assigned to:</span> {complaint.assignedTo}
                          </p>
                        )}
                        {complaint.adminNotes && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Admin Notes:</p>
                            <p className="text-sm text-gray-700">{complaint.adminNotes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPriorityBadge(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(complaint.status)}`}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint)
                            setUpdateData({ status: complaint.status, priority: complaint.priority, assignedTo: complaint.assignedTo || '', adminNotes: complaint.adminNotes || '' })
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded transition"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-4">
                      Submitted: {new Date(complaint.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Leave Requests Tab */}
        {activeTab === 'leaves' && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Leave Requests</h2>
              <p className="text-gray-600 mt-2">Review and approve student leave requests</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : leaves.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg">No leave requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {leaves.map((leave) => (
                  <div key={leave._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{leave.studentId?.name || 'Student'}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeaveStatusBadge(leave.status)}`}>
                            {leave.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">Duration:</span> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700 mb-2"><span className="font-medium">Reason:</span> {leave.reason}</p>
                        {leave.destination && <p className="text-sm text-gray-600"><span className="font-medium">Destination:</span> {leave.destination}</p>}
                        {leave.contactNumber && <p className="text-sm text-gray-600"><span className="font-medium">Contact:</span> {leave.contactNumber}</p>}
                        {leave.emergencyContact && <p className="text-sm text-gray-600"><span className="font-medium">Emergency Contact:</span> {leave.emergencyContact}</p>}
                        {leave.adminRemarks && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Your Remarks:</p>
                            <p className="text-sm text-gray-700">{leave.adminRemarks}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLeave(leave)
                          setUpdateData({ status: leave.status, adminRemarks: leave.adminRemarks || '' })
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition ml-4"
                      >
                        Review
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(leave.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Announcements</h2>
                <p className="text-gray-600 mt-2">Create and manage hostel announcements</p>
              </div>
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                + New Announcement
              </button>
            </div>

            {showAnnouncementForm && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Create Announcement</h3>
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                    <textarea
                      value={announcementForm.message}
                      onChange={(e) => setAnnouncementForm({...announcementForm, message: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={announcementForm.category}
                        onChange={(e) => setAnnouncementForm({...announcementForm, category: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      >
                        <option value="general">General</option>
                        <option value="urgent">Urgent</option>
                        <option value="event">Event</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                      <select
                        value={announcementForm.targetAudience}
                        onChange={(e) => setAnnouncementForm({...announcementForm, targetAudience: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      >
                        <option value="all">All</option>
                        <option value="students">Students Only</option>
                        <option value="staff">Staff Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expires At (Optional)</label>
                      <input
                        type="date"
                        value={announcementForm.expiresAt}
                        onChange={(e) => setAnnouncementForm({...announcementForm, expiresAt: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                      Post Announcement
                    </button>
                    <button type="button" onClick={() => setShowAnnouncementForm(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg">No announcements</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className={`rounded-xl shadow-md border p-6 ${
                    announcement.category === 'urgent' ? 'bg-red-50 border-red-200' :
                    announcement.category === 'event' ? 'bg-purple-50 border-purple-200' :
                    announcement.category === 'maintenance' ? 'bg-orange-50 border-orange-200' :
                    'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            announcement.category === 'urgent' ? 'bg-red-100 text-red-800' :
                            announcement.category === 'event' ? 'bg-purple-100 text-purple-800' :
                            announcement.category === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {announcement.category.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line mb-2">{announcement.message}</p>
                        <p className="text-sm text-gray-600">Target: {announcement.targetAudience}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition ml-4"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Posted: {new Date(announcement.createdAt).toLocaleString()}
                      {announcement.expiresAt && ` • Expires: ${new Date(announcement.expiresAt).toLocaleDateString()}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Complaint Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Complaint</h3>
            
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">{selectedComplaint.title}</p>
              <p className="text-sm text-gray-600 mt-1">Student: {selectedComplaint.studentId?.name}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <select
                  value={updateData.priority}
                  onChange={(e) => setUpdateData({...updateData, priority: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={updateData.assignedTo}
                  onChange={(e) => setUpdateData({...updateData, assignedTo: e.target.value})}
                  placeholder="Staff member name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData({...updateData, adminNotes: e.target.value})}
                  rows={3}
                  placeholder="Internal notes or action taken..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleComplaintUpdate}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Update Complaint
              </button>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Review Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Review Leave Request</h3>
            
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">Student: {selectedLeave.studentId?.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mt-2">{selectedLeave.reason}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Decision</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={updateData.adminRemarks}
                  onChange={(e) => setUpdateData({...updateData, adminRemarks: e.target.value})}
                  rows={3}
                  placeholder="Your remarks or conditions..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLeaveUpdate}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Update Leave Request
              </button>
              <button
                onClick={() => setSelectedLeave(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
