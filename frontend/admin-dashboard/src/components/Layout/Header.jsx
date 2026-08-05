import React from 'react';
import ProfileDropdown from './ProfileDropdown';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 flex items-center justify-between">
      {/* Left: Hamburger + College Name */}
      <div className="flex items-center space-x-3">
        {/* Hamburger Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-200 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* College Name */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">
            The Quantum Group School & College<span className="font-normal text-blue-100"> </span>
          </h1>
        </div>
      </div>

      {/* Right: Profile Dropdown */}
      <ProfileDropdown />
    </header>
  );
};

export default Header;