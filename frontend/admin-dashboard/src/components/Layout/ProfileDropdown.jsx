import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfileDropdown = () => {
  const { admin, token, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [profileData, setProfileData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    profileImage: admin?.profileImage || ''
  });
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image size must be less than 2MB');
      setMessageType('error');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      setMessageType('error');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setLoading(true);
      setMessage('');
      const response = await api.post('/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const imageUrl = response.data.data.profileImage;
        setProfileData(prev => ({
          ...prev,
          profileImage: imageUrl
        }));
        
        // Update admin in localStorage and context
        const updatedAdmin = { ...admin, profileImage: imageUrl };
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
        
        // Update the admin in context
        window.location.reload(); // Refresh to update all components
        
        setMessage('Profile image updated successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(error.response?.data?.message || 'Failed to upload image');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        email: profileData.email
      });

      if (response.data.success) {
        const updatedAdmin = response.data.data;
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
        
        setProfileData({
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          profileImage: updatedAdmin.profileImage || profileData.profileImage
        });
        
        setMessage('Profile updated successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
        
        // Update admin in context (will trigger re-render)
        window.location.reload();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // If no admin, don't render
  if (!admin) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
      >
        {profileData.profileImage ? (
          <img
            src={profileData.profileImage}
            alt={admin?.name}
            className="w-7 h-7 rounded-full object-cover border-2 border-white/30"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  ${admin?.name?.[0] || 'A'}
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-xs">
            {admin?.name?.[0] || 'A'}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-white leading-tight">{admin?.name}</p>
          <p className="text-xs text-blue-100 leading-tight">{admin?.email}</p>
        </div>
        <svg
          className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 text-center">
            <div className="relative inline-block">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt={admin?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/50 mx-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto border-2 border-white/50">
                        ${admin?.name?.[0] || 'A'}
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto border-2 border-white/50">
                  {admin?.name?.[0] || 'A'}
                </div>
              )}
              <button
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                title="Upload profile image"
                disabled={loading}
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-white font-medium mt-2">{profileData.name}</p>
            <p className="text-blue-100 text-xs">{profileData.email}</p>
          </div>

          {/* Edit Form */}
          <div className="px-4 py-4">
            {message && (
              <div className={`mb-3 p-2 rounded-lg text-sm ${messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;