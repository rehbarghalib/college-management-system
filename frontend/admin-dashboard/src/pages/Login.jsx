import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
        
        {/* ===== HEADER - Blue Background ===== */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-white text-base sm:text-lg font-bold">Q</span>
            </div>
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide leading-tight">
            The Quantum Group of Schools & Colleges
          </h1>
         
          <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-white/10">
            <p className="text-blue-200 text-[8px] sm:text-[10px] uppercase tracking-widest">
              Institute Management System (IMS)
            </p>
          </div>
        </div>

        {/* ===== BODY - Login Form ===== */}
        <div className="px-4 sm:px-6 py-5 sm:py-6 bg-white">
          
          {/* Welcome Section */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Sign in to manage your dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl mb-3 sm:mb-4 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* ===== Login Form ===== */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-gray-700 text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-800 placeholder-gray-400"
                placeholder="admin@college.edu"
                required
              />
            </div>

            {/* Password Field with Eye Icon */}
            <div>
              <label className="block text-gray-700 text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-800 placeholder-gray-400 pr-9 sm:pr-11"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link - ✅ Now using Link from react-router-dom */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 sm:py-2.5 px-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-semibold text-sm shadow-lg shadow-blue-600/25"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-400 text-[8px] sm:text-[10px] uppercase tracking-widest">
              🔒 Secure Admin Access
            </p>
            <p className="text-gray-400 text-[8px] sm:text-[10px] mt-1 sm:mt-2">
              © 2025 The Quantum Group. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;