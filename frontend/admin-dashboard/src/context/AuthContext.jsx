import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutTimer, setLogoutTimer] = useState(null);

  // ✅ Dynamic API URL - HTTPS for production
  // ✅ Hardcode the API URL for production
const API_URL = 'https://college-management-system-8omk.onrender.com/api';

  // 20 hours in milliseconds
  const SESSION_TIMEOUT = 20 * 60 * 60 * 1000;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('admin');
    const loginTime = localStorage.getItem('loginTime');
    
    if (storedToken && storedAdmin) {
      try {
        if (loginTime) {
          const elapsed = Date.now() - parseInt(loginTime);
          if (elapsed > SESSION_TIMEOUT) {
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            localStorage.removeItem('loginTime');
            setLoading(false);
            return;
          }
        }

        const tokenData = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenData.exp && tokenData.exp > currentTime) {
          setToken(storedToken);
          setAdmin(JSON.parse(storedAdmin));
          startLogoutTimer();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
          localStorage.removeItem('loginTime');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        localStorage.removeItem('loginTime');
      }
    }
    setLoading(false);
  }, []);

  const startLogoutTimer = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }

    const timer = setTimeout(() => {
      logout('Session expired. Please login again.');
    }, SESSION_TIMEOUT);
    
    setLogoutTimer(timer);
  };

  const login = async (email, password) => {
    try {
      console.log('🔵 Frontend login attempt:', { email });
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      console.log('🟢 Full response:', response.data);

      const { admin, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      localStorage.setItem('loginTime', Date.now().toString());
      
      setAdmin(admin);
      setToken(token);
      startLogoutTimer();
      
      console.log('✅ Login successful, token saved');
      return { success: true };
    } catch (error) {
      console.error('🔴 Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = (message = 'Logged out successfully') => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('loginTime');
    setAdmin(null);
    setToken(null);
    
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
    
    window.location.href = '/login';
  };

  const isAuthenticated = () => {
    if (!token) return false;
    
    try {
      const loginTime = localStorage.getItem('loginTime');
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        if (elapsed > SESSION_TIMEOUT) {
          logout('Session expired. Please login again.');
          return false;
        }
      }

      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return tokenData.exp && tokenData.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const resetTimer = () => {
    if (isAuthenticated()) {
      localStorage.setItem('loginTime', Date.now().toString());
      startLogoutTimer();
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, [logoutTimer]);

  return (
    <AuthContext.Provider value={{
      admin,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      resetTimer,
      API_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
};