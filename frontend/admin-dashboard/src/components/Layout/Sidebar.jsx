import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiUserPlus, 
  FiDollarSign, 
  FiBell, 
  FiFileText, 
  FiSettings,
  FiLogOut
} from 'react-icons/fi';

const Sidebar = ({ closeSidebar }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/teachers', label: 'Teachers', icon: FiUsers },
    { path: '/students', label: 'Students', icon: FiUserPlus },
    { path: '/fees', label: 'Fees', icon: FiDollarSign },
    { path: '/notifications', label: 'Notifications', icon: FiBell },
    { path: '/applications', label: 'Applications', icon: FiFileText },
    { path: '/settings', label: 'Settings', icon: FiSettings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <div className="w-64 bg-[var(--bg)] border-r border-[var(--border)] text-[var(--text)] flex flex-col min-h-screen transition-all duration-300">
      
      {/* Logo Section with Hover Effect */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
        <div className="flex items-center justify-between w-full">
          <img 
            src="/logo.png" 
            alt="Quantum Group Logo" 
            className="ml-6 hover:scale-105 transition-transform duration-300"
            style={{ width: '110px', height: '110px', objectFit: 'cover' }}
          />
          <button
            onClick={closeSidebar}
            className="lg:hidden text-white hover:text-blue-200 text-2xl font-bold hover:rotate-90 transition-transform duration-300"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation with Icons & Hover Effects with Border */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium transform hover:translate-x-1 ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-700/30 border-2 border-blue-400'
                  : 'hover:bg-[var(--accent-bg)] hover:text-[var(--text-h)] hover:shadow-md hover:border-2 hover:border-blue-300 border-2 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                isActive(item.path) ? '' : 'group-hover:scale-110'
              }`} />
              <span className="transition-all duration-300">{item.label}</span>
              {isActive(item.path) && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout with Icon & Hover Effect with Border */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={() => {
            logout();
            if (closeSidebar) closeSidebar();
          }}
          className="flex items-center space-x-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:shadow-md transform hover:translate-x-1 group border-2 border-transparent hover:border-red-300"
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <span className="transition-all duration-300">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;