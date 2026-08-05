import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { FiEdit2, FiTrash2, FiFile, FiDownload, FiX, FiPaperclip, FiImage, FiFileText } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    isPinned: false,
    isPublished: true,
    targetAudience: 'All',
    attachments: []
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await api.post('/notifications/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          setUploadedFiles(prev => [...prev, {
            name: response.data.data.fileName,
            fileUrl: response.data.data.fileUrl,
            fileType: response.data.data.fileType,
            fileSize: response.data.data.fileSize
          }]);
        }
      } catch (error) {
        alert('Failed to upload file: ' + (error.response?.data?.message || error.message));
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        attachments: uploadedFiles
      };

      if (editingNotification) {
        await api.put(`/notifications/${editingNotification._id}`, data);
      } else {
        await api.post('/notifications', data);
      }

      setShowForm(false);
      setEditingNotification(null);
      setUploadedFiles([]);
      setFormData({
        title: '',
        content: '',
        category: 'General',
        isPinned: false,
        isPublished: true,
        targetAudience: 'All',
        attachments: []
      });
      fetchNotifications();
      alert(editingNotification ? 'Notification updated!' : 'Notification created!');
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Error saving notification');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await api.delete(`/notifications/${id}`);
        fetchNotifications();
      } catch (error) {
        alert('Error deleting notification');
      }
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      category: notification.category || 'General',
      isPinned: notification.isPinned || false,
      isPublished: notification.isPublished !== undefined ? notification.isPublished : true,
      targetAudience: notification.targetAudience || 'All',
      attachments: notification.attachments || []
    });
    setUploadedFiles(notification.attachments || []);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">🔔 Notifications</h1>
        <button
          onClick={() => {
            setEditingNotification(null);
            setUploadedFiles([]);
            setFormData({
              title: '',
              content: '',
              category: 'General',
              isPinned: false,
              isPublished: true,
              targetAudience: 'All',
              attachments: []
            });
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 duration-200 w-full sm:w-auto"
        >
          + Create Notification
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-fadeIn border-2 border-blue-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingNotification ? '✏️ Edit Notification' : '➕ Create Notification'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam</option>
                    <option value="Admission">Admission</option>
                    <option value="Event">Event</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Result">Result</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All</option>
                    <option value="Students">Students</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPinned"
                    checked={formData.isPinned}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pin this notification</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Publish now</span>
                </label>
              </div>

              {/* File Upload Section */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">📎 Attachments</label>
                <p className="text-xs text-gray-400 mb-2">Upload PDF, Images, or Documents (Max 5MB each)</p>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <FiPaperclip className="w-4 h-4" />
                    <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Files'}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                    className="hidden"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200 gap-2">
                        <div className="flex items-center space-x-3">
                          {file.fileType?.includes('pdf') ? (
                            <FiFileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                          ) : file.fileType?.includes('image') ? (
                            <FiImage className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <FiFile className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors self-start sm:self-center"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  {editingNotification ? 'Update Notification' : 'Create Notification'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 border-2 border-blue-200 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg font-medium">No notifications created yet.</p>
          <p className="text-gray-400 text-sm mt-2">Click "Create Notification" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification._id} className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">{notification.title}</h3>
                    {notification.isPinned && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex-shrink-0">📌 Pinned</span>
                    )}
                    {!notification.isPublished && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">Draft</span>
                    )}
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">{notification.category}</span>
                  </div>
                  <p className="text-gray-600 mt-1 break-words">{notification.content}</p>
                  
                  {/* Attachments in list */}
                  {notification.attachments && notification.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {notification.attachments.map((file, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center space-x-1">
                          <FiPaperclip className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-32">{file.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <span className="text-xs text-gray-400">
                      📅 {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      👥 {notification.targetAudience || 'All'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(notification)}
                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;