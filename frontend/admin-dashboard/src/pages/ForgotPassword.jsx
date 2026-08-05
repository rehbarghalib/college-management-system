import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setMessage('✅ OTP sent successfully! Please check your email.');
        setMessageType('success');
        setStep(2);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send OTP');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      
      if (response.data.success) {
        setResetToken(response.data.data.resetToken);
        setMessage('✅ OTP verified! Please set your new password.');
        setMessageType('success');
        setStep(3);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid OTP');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', {
        resetToken,
        newPassword,
        confirmPassword
      });
      
      if (response.data.success) {
        setMessage('✅ Password reset successfully! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reset password');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-800 placeholder-gray-400"
                placeholder="admin@college.edu"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                We'll send a 6-digit OTP to this email
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-semibold text-sm shadow-lg shadow-blue-600/25"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-800 placeholder-gray-400 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength="6"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 font-semibold text-sm"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Back
              </button>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-800 placeholder-gray-400"
                placeholder="Enter new password"
                minLength="6"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-800 placeholder-gray-400"
                placeholder="Confirm new password"
                minLength="6"
                required
              />
            </div>
            {newPassword && confirmPassword && newPassword === confirmPassword && (
              <p className="text-xs text-green-600">✅ Passwords match</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 font-semibold text-sm shadow-lg shadow-green-600/25"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-white text-lg font-bold">Q</span>
            </div>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide leading-tight">
            The Quantum Group
          </h1>
          <p className="text-blue-100 text-sm font-medium">Reset Password</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {step === 1 && '🔐 Forgot Password'}
              {step === 2 && '📧 Verify OTP'}
              {step === 3 && '🔑 Set New Password'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 && 'Enter your email to receive a reset code'}
              {step === 2 && 'Enter the OTP sent to your email'}
              {step === 3 && 'Create a new strong password'}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm flex items-start space-x-2 ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {messageType === 'success' ? (
                <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Render Step */}
          {renderStep()}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
              <FiArrowLeft className="mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;