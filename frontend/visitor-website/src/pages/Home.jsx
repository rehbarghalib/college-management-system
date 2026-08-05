import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiBook, FiAward, FiBell, FiCalendar, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';

const Home = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data?.slice(0, 3) || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const features = [
    { icon: FiUsers, title: 'Quality Education', description: 'Committed to excellence in learning' },
    { icon: FiBook, title: 'Expert Faculty', description: 'Highly qualified and experienced teachers' },
    { icon: FiAward, title: 'Student Success', description: 'Proven track record of academic excellence' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto md:mx-0 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Welcome to <span className="text-blue-200">The Quantum Group</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-6">
              of School & College
            </p>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-2xl mx-auto md:mx-0">
              Providing quality education and shaping the leaders of tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-start">
              <Link
                to="/apply"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Apply Now <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/notifications"
                className="bg-blue-500/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/40 transition-all duration-300 inline-flex items-center justify-center border border-white/20 hover:border-white/40 transform hover:-translate-y-1"
              >
                View Notifications
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Why Choose Us
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
            Discover what makes The Quantum Group the perfect choice for your education
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="text-center p-6 md:p-8 rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 bg-white"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300 group-hover:scale-110 transform">
                    <Icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
                  <div className="mt-4 w-12 h-1 bg-blue-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Notifications */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">📢 Latest Updates</h2>
              <p className="text-gray-500 mt-1">Stay informed with our latest announcements</p>
            </div>
            <Link 
              to="/notifications" 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group border-2 border-blue-600 hover:border-blue-800 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
            >
              View All <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                  <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
              <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No notifications available.</p>
              <p className="text-gray-400 text-sm">Check back later for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                        <FiBell className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 text-lg line-clamp-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400 flex items-center">
                            <FiCalendar className="w-3 h-3 mr-1" />
                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {notification.category && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {notification.category}
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
      </section>
    </div>
  );
};

export default Home;