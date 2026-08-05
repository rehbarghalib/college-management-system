import React, { useState, useEffect } from 'react';
import { FiBell, FiSearch, FiDownload, FiFile, FiImage, FiPaperclip, FiCalendar, FiFilter } from 'react-icons/fi';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      console.log('📢 Notifications:', response.data);
      setNotifications(response.data.data || []);
      setFilteredNotifications(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    if (!searchTerm.trim()) {
      setFilteredNotifications(notifications);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = notifications.filter(n =>
        n.title?.toLowerCase().includes(term) ||
        n.content?.toLowerCase().includes(term)
      );
      setFilteredNotifications(filtered);
    }
  };

  // ✅ Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <FiFile className="w-4 h-4 text-red-500" />;
    if (fileType?.includes('image')) return <FiImage className="w-4 h-4 text-green-500" />;
    return <FiPaperclip className="w-4 h-4 text-blue-500" />;
  };

  // ✅ Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-blue-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">📢 Notifications</h1>
        <p className="text-gray-500 text-sm md:text-base">Stay updated with the latest announcements</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
        <div className="text-sm text-gray-500 self-center">
          {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'} found
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
          <FiBell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No notifications found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Try adjusting your search' : 'Check back later for updates'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification._id} 
              className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
            >
              <div className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                    <FiBell className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                        {notification.title}
                      </h3>
                      {notification.isPinned && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex-shrink-0">📌 Pinned</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm md:text-base mt-1 leading-relaxed">
                      {notification.content}
                    </p>
                    
                    {/* Attachments */}
                    {notification.attachments && notification.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">📎 Attachments</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {notification.attachments.map((file, index) => (
                            <a
                              key={index}
                              href={file.fileUrl}
                              download={file.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200 border-2 border-gray-200 hover:border-blue-300 group/file"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                {getFileIcon(file.fileType)}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
                                </div>
                              </div>
                              <FiDownload className="w-5 h-5 text-blue-600 opacity-0 group-hover/file:opacity-100 transition-opacity duration-300 flex-shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400 flex items-center">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {notification.category && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                          {notification.category}
                        </span>
                      )}
                      {notification.targetAudience && notification.targetAudience !== 'All' && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                          👥 {notification.targetAudience}
                        </span>
                      )}
                    </div>
                  </div>
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