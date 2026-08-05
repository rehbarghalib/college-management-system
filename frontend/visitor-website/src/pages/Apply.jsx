import React, { useState, useEffect } from 'react';
import { FiSend, FiCheckCircle, FiAlertCircle, FiInfo, FiUser, FiMail, FiPhone, FiBook, FiAward, FiMessageSquare, FiPercent } from 'react-icons/fi';
import api from '../services/api';

const Apply = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    course: '',
    qualification: '',
    obtainedMarks: '',
    totalMarks: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [applyEnabled, setApplyEnabled] = useState(true);
  const [visitorMessage, setVisitorMessage] = useState('');
  const [visitorMessageType, setVisitorMessageType] = useState('info');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('🔵 Fetching settings...');
      const response = await api.get('/settings');
      console.log('🟢 Settings response:', response.data);
      
      const settings = response.data.data;
      if (settings && settings.visitorSettings) {
        setApplyEnabled(settings.visitorSettings.applyOnlineEnabled !== false);
        setVisitorMessage(settings.visitorSettings.visitorMessage || '');
        setVisitorMessageType(settings.visitorSettings.visitorMessageType || 'info');
      }
      setLoadingSettings(false);
    } catch (error) {
      console.error('🔴 Error fetching settings:', error);
      setLoadingSettings(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/applications', formData);
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        course: '',
        qualification: '',
        obtainedMarks: '',
        totalMarks: '',
        message: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyles = () => {
    switch(visitorMessageType) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getMessageIcon = () => {
    switch(visitorMessageType) {
      case 'warning':
        return <FiAlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'danger':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loadingSettings) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If applications are disabled
  if (!applyEnabled) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center shadow-lg">
          <FiAlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-700">Applications Currently Closed</h2>
          <p className="text-yellow-600 mt-2">We are not accepting applications at this time.</p>
          {visitorMessage && (
            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-yellow-200 text-left">
              <p className="text-gray-700">{visitorMessage}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">📝 Apply Online</h1>
        <p className="text-gray-500">Fill out the form below to submit your application</p>
      </div>

      {/* Visitor Message */}
      {visitorMessage && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${getMessageStyles()} flex items-start space-x-3 max-w-2xl mx-auto shadow-sm`}>
          {getMessageIcon()}
          <p className="text-sm">{visitorMessage}</p>
        </div>
      )}

      {success ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center max-w-2xl mx-auto shadow-lg">
          <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700">Application Submitted!</h2>
          <p className="text-green-600 mt-2">We will contact you shortly.</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
          >
            Submit another application
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-6 md:p-8 max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                <FiUser className="inline mr-2 text-blue-600" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Email - ✅ Optional */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                <FiMail className="inline mr-2 text-blue-600" />
                Email <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address (optional)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                <FiPhone className="inline mr-2 text-blue-600" />
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                <FiBook className="inline mr-2 text-blue-600" />
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select a course</option>
                <option value="Pre-Medical">Pre-Medical</option>
                <option value="Pre-Engineering">Pre-Engineering</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                <FiAward className="inline mr-2 text-blue-600" />
                Qualification <span className="text-red-500">*</span>
              </label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select qualification</option>
                <option value="Matric (10th)">Matric (10th)</option>
                <option value="1st Year">1st Year</option>
              </select>
            </div>

            {/* Obtained Marks & Total Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                  <FiPercent className="inline mr-2 text-blue-600" />
                  Obtained Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="obtainedMarks"
                  value={formData.obtainedMarks}
                  onChange={handleChange}
                  placeholder="e.g., 850"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                  <FiPercent className="inline mr-2 text-blue-600" />
                  Total Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  placeholder="e.g., 1100"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Percentage Display */}
            {formData.obtainedMarks && formData.totalMarks && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                <p className="text-sm text-gray-600">
                  Percentage: <span className="font-bold text-blue-700">
                    {((parseFloat(formData.obtainedMarks) / parseFloat(formData.totalMarks)) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                <FiMessageSquare className="inline mr-2 text-blue-600" />
                Message <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Any additional information..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-semibold flex items-center justify-center space-x-2 mt-6 shadow-lg shadow-blue-600/25"
          >
            <FiSend className="w-5 h-5" />
            <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
          </button>

          <p className="text-center text-gray-400 text-xs mt-4">
            <span className="text-red-500">*</span> Required fields | 
            <span className="text-gray-400 ml-1">Email is optional</span>
          </p>
        </form>
      )}
    </div>
  );
};

export default Apply;