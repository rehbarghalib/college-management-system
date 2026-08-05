import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FiUser, FiMail, FiLock, FiCamera, FiSave, FiUserCheck,
  FiShield, FiAlertCircle, FiGlobe, FiMapPin, FiPhone, 
  FiFacebook, FiTwitter, FiInstagram, FiYoutube,
  FiEdit2
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Settings = () => {
  const { admin, token, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Profile State
  const [profileData, setProfileData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    profileImage: admin?.profileImage || ''
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Footer Settings State
  const [footerSettings, setFooterSettings] = useState({
    address: '123 Education Street, City, Country',
    phone: '+92 123 4567890',
    email: 'info@quantumgroup.edu',
    facebook: 'https://facebook.com/quantumgroup',
    whatsapp: 'https://wa.me/923001234567',
    twitter: '',
    instagram: '',
    youtube: ''
  });

  // Visitor Settings State
  const [visitorSettings, setVisitorSettings] = useState({
    applyOnlineEnabled: true,
    visitorMessage: '',
    visitorMessageType: 'info'
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingFooter, setLoadingFooter] = useState(false);
  const [loadingVisitor, setLoadingVisitor] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch settings on load
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      const settings = response.data.data;
      console.log('📥 Settings loaded:', settings);
      
      if (settings) {
        // Footer Settings
        if (settings.footerSettings) {
          setFooterSettings({
            address: settings.footerSettings.address || '123 Education Street, City, Country',
            phone: settings.footerSettings.phone || '+92 123 4567890',
            email: settings.footerSettings.email || 'info@quantumgroup.edu',
            facebook: settings.footerSettings.facebook || 'https://facebook.com/quantumgroup',
            whatsapp: settings.footerSettings.whatsapp || 'https://wa.me/923001234567',
            twitter: settings.footerSettings.twitter || '',
            instagram: settings.footerSettings.instagram || '',
            youtube: settings.footerSettings.youtube || ''
          });
        }
        
        // Visitor Settings
        if (settings.visitorSettings) {
          setVisitorSettings({
            applyOnlineEnabled: settings.visitorSettings.applyOnlineEnabled !== false,
            visitorMessage: settings.visitorSettings.visitorMessage || '',
            visitorMessageType: settings.visitorSettings.visitorMessageType || 'info'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let profileImageUrl = profileData.profileImage;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', imageFile);
        
        const uploadRes = await api.post('/auth/upload-profile-image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadRes.data.success) {
          profileImageUrl = uploadRes.data.data.profileImage;
        }
      }

      const response = await api.put('/auth/profile', {
        name: profileData.name,
        email: profileData.email,
        profileImage: profileImageUrl
      });

      if (response.data.success) {
        const updatedAdmin = response.data.data;
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
        setProfileData({
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          profileImage: updatedAdmin.profileImage || ''
        });
        setMessage('Profile updated successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setMessage('Password changed successfully!');
        setMessageType('success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Save Footer Settings
  const saveFooterSettings = async () => {
    setLoadingFooter(true);
    setMessage('');

    try {
      console.log('📤 Saving footer settings:', footerSettings);
      
      const response = await api.put('/settings/footer', {
        footerSettings
      });

      console.log('🟢 Response:', response.data);

      if (response.data.success) {
        setMessage('✅ Footer settings saved successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
        await fetchSettings();
      }
    } catch (error) {
      console.error('🔴 Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || '❌ Failed to save footer settings');
      setMessageType('error');
    } finally {
      setLoadingFooter(false);
    }
  };

  // Save Visitor Settings
  const saveVisitorSettings = async () => {
    setLoadingVisitor(true);
    setMessage('');

    try {
      const response = await api.put('/settings/visitor', {
        visitorSettings
      });

      if (response.data.success) {
        setMessage('✅ Visitor settings saved successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
        await fetchSettings();
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || '❌ Failed to save visitor settings');
      setMessageType('error');
    } finally {
      setLoadingVisitor(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'password', label: 'Password', icon: FiLock },
    { id: 'footer', label: 'Footer Settings', icon: FiEdit2 },
    { id: 'visitor', label: 'Visitor Settings', icon: FiGlobe },
    { id: 'account', label: 'Account', icon: FiShield },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Settings</h1>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-blue-300 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Profile Settings</h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="flex items-center space-x-4 mb-6 p-4 border-2 border-gray-200 rounded-lg">
              <div className="relative">
                {imagePreview || profileData.profileImage ? (
                  <img
                    src={imagePreview || profileData.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <FiUser className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 text-white hover:bg-blue-700 transition shadow-lg"
                >
                  <FiCamera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                <p className="text-xs text-gray-500">Click the camera icon to upload</p>
                <p className="text-xs text-gray-400">JPG, PNG, GIF (Max 2MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-2 border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50 border-2 border-blue-400"
              >
                <FiSave className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-purple-300 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Change Password</h2>
          
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                {passwordData.newPassword && passwordData.confirmPassword && (
                  <p className={`text-xs mt-1 ${
                    passwordData.newPassword === passwordData.confirmPassword 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {passwordData.newPassword === passwordData.confirmPassword 
                      ? '✅ Passwords match' 
                      : '❌ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2 disabled:opacity-50 border-2 border-purple-400"
              >
                <FiLock className="w-4 h-4" />
                <span>{loading ? 'Changing...' : 'Change Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer Settings Tab */}
      {activeTab === 'footer' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-green-300 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">🌐 Footer Settings</h2>
          
          <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiMapPin className="inline mr-2" />
                Address
              </label>
              <input
                type="text"
                value={footerSettings.address}
                onChange={(e) => setFooterSettings(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiPhone className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="text"
                value={footerSettings.phone}
                onChange={(e) => setFooterSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiMail className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={footerSettings.email}
                onChange={(e) => setFooterSettings(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiFacebook className="inline mr-2 text-blue-600" />
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={footerSettings.facebook}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, facebook: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaWhatsapp className="inline mr-2 text-green-500" />
                  WhatsApp URL
                </label>
                <input
                  type="url"
                  value={footerSettings.whatsapp}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="https://wa.me/923001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiTwitter className="inline mr-2 text-sky-500" />
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={footerSettings.twitter}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, twitter: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="https://twitter.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiInstagram className="inline mr-2 text-pink-500" />
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={footerSettings.instagram}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, instagram: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="https://instagram.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiYoutube className="inline mr-2 text-red-500" />
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={footerSettings.youtube}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, youtube: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="https://youtube.com/yourchannel"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={saveFooterSettings}
                disabled={loadingFooter}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                <span>{loadingFooter ? 'Saving...' : 'Save Footer Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Settings Tab */}
      {activeTab === 'visitor' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-orange-300 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">🌐 Visitor Settings</h2>
          
          <div className="space-y-6 p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Apply Online</p>
                <p className="text-xs text-gray-500">Enable/disable online applications</p>
              </div>
              <button
                onClick={() => {
                  setVisitorSettings(prev => ({
                    ...prev,
                    applyOnlineEnabled: !prev.applyOnlineEnabled
                  }));
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  visitorSettings.applyOnlineEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  visitorSettings.applyOnlineEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Message</label>
              <textarea
                value={visitorSettings.visitorMessage}
                onChange={(e) => setVisitorSettings(prev => ({
                  ...prev,
                  visitorMessage: e.target.value
                }))}
                rows="3"
                placeholder="Enter a message for visitors"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
              <select
                value={visitorSettings.visitorMessageType}
                onChange={(e) => setVisitorSettings(prev => ({
                  ...prev,
                  visitorMessageType: e.target.value
                }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="info">ℹ️ Info (Blue)</option>
                <option value="warning">⚠️ Warning (Yellow)</option>
                <option value="success">✅ Success (Green)</option>
                <option value="danger">🔴 Danger (Red)</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveVisitorSettings}
                disabled={loadingVisitor}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                <span>{loadingVisitor ? 'Saving...' : 'Save Visitor Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-green-300 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Account Information</h2>
          
          <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Account Type</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
              <FiUserCheck className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <p className="text-sm text-gray-500">Super Admin</p>
              </div>
              <FiShield className="w-5 h-5 text-purple-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-500">{admin?.email}</p>
              </div>
              <FiMail className="w-5 h-5 text-green-600" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Account Status</p>
                <p className="text-sm text-green-600 font-medium">Active</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2 border-2 border-red-400"
            >
              <FiAlertCircle className="w-4 h-4" />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;