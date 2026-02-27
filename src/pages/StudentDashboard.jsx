import { useState, useEffect } from 'react'

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('complaints')
  const [complaints, setComplaints] = useState([])
  const [leaves, setLeaves] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [showComplaintForm, setShowComplaintForm] = useState(false)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [complaintForm, setComplaintForm] = useState({
    category: 'room_maintenance',
    title: '',
    description: '',
    location: '',
    roomNumber: '',
    priority: 'medium'
  })
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    destination: '',
    contactNumber: '',
    emergencyContact: ''
  })
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints()
    else if (activeTab === 'leaves') fetchLeaves()
    else if (activeTab === 'announcements') fetchAnnouncements()
  }, [activeTab])

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

  const handleComplaintSubmit = async (e) => {
    e.preventDefault()
    if (!complaintForm.title.trim() || !complaintForm.description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(complaintForm)
      })

      if (!response.ok) throw new Error('Failed to submit complaint')

      setComplaintForm({ category: 'room_maintenance', title: '', description: '', location: '', roomNumber: '', priority: 'medium' })
      setShowComplaintForm(false)
      setError('')
      await fetchComplaints()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(leaveForm)
      })

      if (!response.ok) throw new Error('Failed to submit leave request')

      setLeaveForm({ startDate: '', endDate: '', reason: '', destination: '', contactNumber: '', emergencyContact: '' })
      setShowLeaveForm(false)
      setError('')
      await fetchLeaves()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
    return statusMatch && priorityMatch
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">HostelOps</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, <span className="font-semibold">{user.name}</span></span>
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
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Student Dashboard</h2>
          <p className="text-gray-600 mt-2">Manage complaints, leave requests, and view announcements</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('complaints')}
              className={`pb-3 px-1 font-semibold transition ${activeTab === 'complaints' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
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
              className={`pb-3 px-1 font-semibold transition ${activeTab === 'leaves' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
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
              className={`pb-3 px-1 font-semibold transition ${activeTab === 'announcements' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
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

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <>
            <div className="mb-6 flex gap-4 items-center flex-wrap">
              <button
                onClick={() => setShowComplaintForm(!showComplaintForm)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105"
              >
                + New Complaint
              </button>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {showComplaintForm && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8 animate-slide-up">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Submit New Complaint</h3>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleComplaintSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                      <select
                        value={complaintForm.category}
                        onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {Object.entries(categories).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Priority *</label>
                      <select
                        value={complaintForm.priority}
                        onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
                      <input
                        type="text"
                        value={complaintForm.roomNumber}
                        onChange={(e) => setComplaintForm({...complaintForm, roomNumber: e.target.value})}
                        placeholder="e.g., 101, A-205"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location/Area</label>
                      <input
                        type="text"
                        value={complaintForm.location}
                        onChange={(e) => setComplaintForm({...complaintForm, location: e.target.value})}
                        placeholder="e.g., Block A, Common Room"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={complaintForm.title}
                      onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})}
                      placeholder="Brief title of your complaint"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                      placeholder="Detailed description of the issue..."
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowComplaintForm(false)
                        setError('')
                      }}
                      className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading && !showComplaintForm ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 text-lg">No complaints found</p>
                <p className="text-gray-500 mt-1">Click "New Complaint" to report an issue</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Category:</span> {categories[complaint.category] || complaint.category}
                          </span>
                          {complaint.roomNumber && (
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Room:</span> {complaint.roomNumber}
                            </span>
                          )}
                          {complaint.location && (
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Location:</span> {complaint.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPriorityBadge(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(complaint.status)}`}>
                          {complaint.status === 'in_progress' ? 'In Progress' : complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{complaint.description}</p>
                    {complaint.assignedTo && (
                      <p className="text-sm text-blue-600 mb-2">
                        <span className="font-medium">Assigned to:</span> {complaint.assignedTo}
                      </p>
                    )}
                    {complaint.adminNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">Admin Notes:</p>
                        <p className="text-sm text-blue-800">{complaint.adminNotes}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Submitted: {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString()}</span>
                      {complaint.resolvedAt && (
                        <span className="text-green-600">Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}</span>
                      )}
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
              <button
                onClick={() => setShowLeaveForm(!showLeaveForm)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105"
              >
                + New Leave Request
              </button>
            </div>

            {showLeaveForm && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8 animate-slide-up">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Submit Leave Request</h3>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                      <input
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
                    <textarea
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                      placeholder="Reason for leave..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
                      <input
                        type="text"
                        value={leaveForm.destination}
                        onChange={(e) => setLeaveForm({...leaveForm, destination: e.target.value})}
                        placeholder="Where will you be?"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                      <input
                        type="tel"
                        value={leaveForm.contactNumber}
                        onChange={(e) => setLeaveForm({...leaveForm, contactNumber: e.target.value})}
                        placeholder="Your contact number"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="text"
                      value={leaveForm.emergencyContact}
                      onChange={(e) => setLeaveForm({...leaveForm, emergencyContact: e.target.value})}
                      placeholder="Emergency contact person & number"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLeaveForm(false)
                        setError('')
                      }}
                      className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading && !showLeaveForm ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : leaves.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-lg">No leave requests submitted</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {leaves.map((leave) => (
                  <div key={leave._id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLeaveStatusBadge(leave.status)}`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{leave.reason}</p>
                        {leave.destination && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Destination:</span> {leave.destination}
                          </p>
                        )}
                        {leave.contactNumber && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Contact:</span> {leave.contactNumber}
                          </p>
                        )}
                        {leave.adminRemarks && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-900 mb-1">Admin Remarks:</p>
                            <p className="text-sm text-blue-800">{leave.adminRemarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(leave.createdAt).toLocaleDateString()}
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
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
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
                        <p className="text-gray-700 whitespace-pre-line">{announcement.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                      <span>Posted by: {announcement.createdBy?.name || 'Admin'}</span>
                      <span>{new Date(announcement.createdAt).toLocaleDateString()} at {new Date(announcement.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
