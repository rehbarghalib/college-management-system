import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMapPin, FiPhone, FiMail, FiFacebook, FiTwitter, FiInstagram, FiYoutube
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api from '../../services/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState({
    address: '123 Education Street, City, Country',
    phone: '+92 123 4567890',
    email: 'info@quantumgroup.edu',
    facebook: '#',
    whatsapp: '#',
    twitter: '#',
    instagram: '#',
    youtube: '#'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const fetchFooterSettings = async () => {
    try {
      const response = await api.get('/settings');
      const settings = response.data.data;
      
      if (settings && settings.footerSettings) {
        setFooterData({
          address: settings.footerSettings.address || '123 Education Street, City, Country',
          phone: settings.footerSettings.phone || '+92 123 4567890',
          email: settings.footerSettings.email || 'info@quantumgroup.edu',
          facebook: settings.footerSettings.facebook || '#',
          whatsapp: settings.footerSettings.whatsapp || '#',
          twitter: settings.footerSettings.twitter || '#',
          instagram: settings.footerSettings.instagram || '#',
          youtube: settings.footerSettings.youtube || '#'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching footer settings:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <footer className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="text-center text-blue-100">Loading...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">The Quantum Group of School & College.</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Providing quality education since 2020. Committed to excellence in learning and character development.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-blue-100 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/notifications" className="text-blue-100 hover:text-white transition-colors">Notifications</Link></li>
              <li><Link to="/apply" className="text-blue-100 hover:text-white transition-colors">Apply Online</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2 text-blue-100">
                <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{footerData.address}</span>
              </li>
              <li className="flex items-center space-x-2 text-blue-100">
                <FiPhone className="w-4 h-4" />
                <span>{footerData.phone}</span>
              </li>
              <li className="flex items-center space-x-2 text-blue-100">
                <FiMail className="w-4 h-4" />
                <span>{footerData.email}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex flex-wrap gap-3">
              {footerData.facebook && footerData.facebook !== '#' && (
                <a 
                  href={footerData.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                  aria-label="Facebook"
                >
                  <FiFacebook size={22} />
                </a>
              )}
              {footerData.twitter && footerData.twitter !== '#' && (
                <a 
                  href={footerData.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                  aria-label="Twitter"
                >
                  <FiTwitter size={22} />
                </a>
              )}
              {footerData.instagram && footerData.instagram !== '#' && (
                <a 
                  href={footerData.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                  aria-label="Instagram"
                >
                  <FiInstagram size={22} />
                </a>
              )}
              {footerData.youtube && footerData.youtube !== '#' && (
                <a 
                  href={footerData.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                  aria-label="YouTube"
                >
                  <FiYoutube size={22} />
                </a>
              )}
              {footerData.whatsapp && footerData.whatsapp !== '#' && (
                <a 
                  href={footerData.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform duration-200"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={22} />
                </a>
              )}
            </div>
            <p className="text-xs text-blue-200 mt-4">
              © {currentYear} The Quantum Group Of School & College. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;