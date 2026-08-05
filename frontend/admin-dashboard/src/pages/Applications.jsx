import React, { useState, useEffect } from 'react';
import api from '../services/api';
import * as XLSX from 'xlsx';
import { 
  FiEye, FiTrash2, FiCheckCircle, FiXCircle, FiClock, 
  FiSearch, FiDownload, FiFilter, FiUser, FiMail, FiPhone,
  FiBook, FiAward, FiMessageSquare, FiCalendar, FiRefreshCw,
  FiFileText
} from 'react-icons/fi';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications');
      setApplications(response.data.data || []);
      setFilteredApplications(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
    }
  };

  const refreshApplications = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/applications');
      setApplications(response.data.data || []);
      setFilteredApplications(response.data.data || []);
      const refreshMsg = document.getElementById('refreshMessage');
      if (refreshMsg) {
        refreshMsg.style.display = 'block';
        setTimeout(() => {
          refreshMsg.style.display = 'none';
        }, 2000);
      }
    } catch (error) {
      console.error('Error refreshing applications:', error);
      alert('Failed to refresh applications');
    } finally {
      setRefreshing(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(app =>
        app.fullName?.toLowerCase().includes(term) ||
        app.email?.toLowerCase().includes(term) ||
        app.phone?.includes(term) ||
        app.course?.toLowerCase().includes(term)
      );
    }

    setFilteredApplications(filtered);
  };

  // ✅ Export to Excel
  const exportToExcel = () => {
    if (filteredApplications.length === 0) {
      alert('No applications to export');
      return;
    }

    const data = filteredApplications.map((app, index) => ({
      'S.No': index + 1,
      'Full Name': app.fullName,
      'Email': app.email,
      'Phone': app.phone,
      'Course': app.course,
      'Qualification': app.qualification,
      'Status': app.status.charAt(0).toUpperCase() + app.status.slice(1),
      'Message': app.message || 'N/A',
      'Submitted Date': new Date(app.createdAt).toLocaleDateString(),
      'Admin Remarks': app.adminRemarks || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    
    // Auto column widths
    const colWidths = [
      { wch: 6 },  // S.No
      { wch: 20 }, // Full Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Course
      { wch: 15 }, // Qualification
      { wch: 12 }, // Status
      { wch: 30 }, // Message
      { wch: 15 }, // Submitted Date
      { wch: 25 }, // Admin Remarks
    ];
    ws['!cols'] = colWidths;

    const fileName = `Applications_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/applications/${id}`, {
        status: newStatus,
        adminRemarks: remarks
      });
      await fetchApplications();
      setStatusUpdate('');
      setRemarks('');
      setShowDetails(false);
      alert('Application status updated successfully!');
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        fetchApplications();
      } catch (error) {
        alert('Error deleting application');
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
      shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'reviewing': return <FiEye className="w-4 h-4" />;
      case 'shortlisted': return <FiCheckCircle className="w-4 h-4" />;
      case 'approved': return <FiCheckCircle className="w-4 h-4" />;
      case 'rejected': return <FiXCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">📄 Applications</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span 
            id="refreshMessage" 
            className="text-sm text-green-600 font-medium hidden"
          >
            ✅ Refreshed!
          </span>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
          >
            <FiFileText className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={refreshApplications}
            disabled={refreshing}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 hover:shadow-2xl transition-shadow">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="text-2xl font-bold text-gray-800">{applications.length}</p>
          <div className="w-full h-1 mt-2 rounded-full bg-blue-500"></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 p-4 hover:shadow-2xl transition-shadow">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-800">
            {applications.filter(a => a.status === 'pending').length}
          </p>
          <div className="w-full h-1 mt-2 rounded-full bg-yellow-500"></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-4 hover:shadow-2xl transition-shadow">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-gray-800">
            {applications.filter(a => a.status === 'approved').length}
          </p>
          <div className="w-full h-1 mt-2 rounded-full bg-green-500"></div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-4 hover:shadow-2xl transition-shadow">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-gray-800">
            {applications.filter(a => a.status === 'rejected').length}
          </p>
          <div className="w-full h-1 mt-2 rounded-full bg-red-500"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Search</label>
            <div className="relative mt-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Applications</option>
              <option value="pending">⏳ Pending</option>
              <option value="reviewing">🔍 Reviewing</option>
              <option value="shortlisted">⭐ Shortlisted</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-500 mt-2">
              Total: <span className="font-bold text-blue-600">{filteredApplications.length}</span> applications
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 border-2 border-blue-200 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg font-medium">No applications found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || filterStatus !== 'all' ? 'Try changing your filters' : 'New applications will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((app, index) => (
                  <tr key={app._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">#{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{app.fullName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-sm hidden md:table-cell">{app.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-sm hidden sm:table-cell">{app.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {app.course}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusBadge(app.status)}`}>
                        {getStatusIcon(app.status)}
                        <span>{getStatusLabel(app.status)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm hidden xl:table-cell">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors mr-1"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors text-2xl"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold">Application Details</h2>
              <p className="text-blue-100">Review and manage this application</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center space-x-1 text-xs font-medium px-3 py-1 rounded-full border ${getStatusBadge(selectedApplication.status)}`}>
                  {getStatusIcon(selectedApplication.status)}
                  <span className="text-white">{getStatusLabel(selectedApplication.status)}</span>
                </span>
                <span className="text-xs text-blue-200">
                  Submitted: {formatDate(selectedApplication.createdAt)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                  <FiUser className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium truncate">{selectedApplication.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                  <FiMail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium truncate">{selectedApplication.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                  <FiPhone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium truncate">{selectedApplication.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                  <FiBook className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Course</p>
                    <p className="text-sm font-medium truncate">{selectedApplication.course}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                  <FiAward className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Qualification</p>
                    <p className="text-sm font-medium truncate">{selectedApplication.qualification}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                  <FiCalendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="text-sm font-medium truncate">{formatDate(selectedApplication.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedApplication.message && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <FiMessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Message</p>
                      <p className="text-sm font-medium break-words">{selectedApplication.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Remarks */}
              {selectedApplication.adminRemarks && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-500">Admin Remarks</p>
                  <p className="text-sm font-medium text-blue-700">{selectedApplication.adminRemarks}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Update Status</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={statusUpdate || selectedApplication.status}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="reviewing">🔍 Reviewing</option>
                    <option value="shortlisted">⭐ Shortlisted</option>
                    <option value="approved">✅ Approved</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Add remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication._id, statusUpdate || selectedApplication.status)}
                    disabled={updating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setShowDetails(false);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this application?')) {
                      handleDelete(selectedApplication._id);
                      setShowDetails(false);
                    }
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Delete Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;