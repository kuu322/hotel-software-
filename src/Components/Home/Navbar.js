import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { Home, Utensils, Info, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoginRegisterPopup from './LoginRegisterPopup';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Login popup toggle
  const [user, setUser] = useState(null); // User state
  const [profileOpen, setProfileOpen] = useState(false); // Profile dropdown toggle
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-menu')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setProfileOpen(false);
    navigate('/');
  };

  const goToDashboard = () => {
    navigate('/user-dashboard', { state: { user } });
    setProfileOpen(false);
  };

  // Navigation items for both desktop and mobile
  const navItems = [
    { label: 'Home', icon: <Home size={18} />, path: '/' },
    { label: 'Menu', icon: <Utensils size={18} />, path: '/menu' },
    { label: 'About', icon: <Info size={18} />, path: '/about' },
    { label: 'Contact', icon: <Phone size={18} />, path: '/contact' },
  ];

  // Get first character for avatar
  const getAvatarInitial = () => {
    const name = user?.LOGIN_NAME || user?.LOGIN_EMAIL || 'P';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="bg-red-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MRK Hotel" className="h-8 w-auto" />
            <span className="text-xl sm:text-2xl font-bold tracking-wide">MRK Hotel</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 text-sm sm:text-base items-center">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="flex items-center gap-1 hover:text-gray-200 transition"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-6 md:gap-8"> {/* Increased gap for more space */}
            {!user ? (
              <button
                className="bg-white text-blue-950 px-4 py-2 rounded-full hover:bg-gray-200 transition shadow-md font-semibold"
                onClick={() => setIsLoginOpen(true)}
                aria-label="Open login or register popup"
              >
                Login/Reg
              </button>
            ) : (
              <div className="relative profile-menu">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-950 text-white font-semibold shadow-md hover:bg-blue-800 transition"
                  aria-expanded={profileOpen}
                  aria-label="Toggle profile menu"
                >
                  {getAvatarInitial()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg text-black z-20">
                    {user.role === 'admin' ? (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                      >
                        Admin Panel
                      </button>
                    ) : (
                      <button
                        onClick={goToDashboard}
                        className="w-full text-left px-4 py-2 hover:bg-blue-100 transition"
                      >
                        Dashboard
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-100 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger for Mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-red-700 px-4 pb-4 space-y-2">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="block flex items-center gap-2 py-1 hover:text-gray-200 transition"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Render LoginRegisterPopup */}
      {isLoginOpen && <LoginRegisterPopup setIsLoginOpen={setIsLoginOpen} setUser={setUser} />}
    </>
  );
};

export default Navbar;