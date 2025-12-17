import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HeaderNew: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Kundli', path: '/' },
    { name: 'Daily Horoscope', path: '/' },
    { name: 'Services', path: '/pricing' },
    { name: 'Refer & Earn', path: '/refer' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className={`text-2xl font-bold bg-gradient-to-r from-royal-600 to-purple-600 bg-clip-text text-transparent ${
              isScrolled ? 'text-gray-900' : ''
            }`}>
              ASTROVERSE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-gold-600 font-medium transition-colors duration-200 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-500 to-gold-700 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {token ? (
              <Link
                to="/dashboard"
                className="px-6 py-2 text-gray-700 font-semibold hover:text-gold-600 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/"
                  className="px-6 py-2 text-gray-700 font-semibold hover:text-gold-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/"
                  className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-gold-600 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gold-600 font-medium transition-colors py-2"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                {token ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-6 py-2 text-center text-gray-700 font-semibold hover:text-gold-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-6 py-2 text-center text-gray-700 font-semibold hover:text-gold-600 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-6 py-3 text-center bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-full"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default HeaderNew;

