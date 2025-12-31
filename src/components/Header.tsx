import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { token, setToken, setUserId, setProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!token || !!localStorage.getItem('ibhakt_token');
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('ibhakt_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUserId(null);
    setProfile(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const closeNav = () => setIsNavOpen(false);

  if (isAdmin) {
    // Simple header for admin pages (but not for login page)
    if (location.pathname === '/admin/login') {
      return null; // No header on login page
    }
    
    return (
      <nav className={`navbar navbar-expand-lg glass-nav fixed-top ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/admin/dashboard">
            <img 
              src="/ibhakt_logo.jpeg" 
              alt="iBhakt Logo" 
              style={{ 
                height: '45px', 
                width: 'auto',
                minWidth: '45px',
                maxWidth: '55px',
                marginRight: '12px',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                filter: 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.3))',
                borderRadius: '8px',
                padding: '4px',
                background: 'transparent'
              }} 
            />
            <span className="fw-bold text-gradient">iBhakt Admin</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`navbar navbar-expand-lg glass-nav fixed-top ${isScrolled ? 'shadow-lg' : ''}`} style={{ transition: 'all 0.3s ease' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeNav}>
          <img 
            src="/ibhakt_logo.jpeg" 
            alt="iBhakt Logo" 
            style={{ 
              height: '45px', 
              width: 'auto',
              minWidth: '45px',
              maxWidth: '55px',
              marginRight: '12px',
              objectFit: 'contain',
              objectPosition: 'center',
              display: 'block',
              filter: 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.3))',
              borderRadius: '8px',
              padding: '4px',
              background: 'transparent',
              transition: 'all 0.3s ease'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(0 4px 12px rgba(251, 191, 36, 0.5)) brightness(1.1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(0 2px 8px rgba(251, 191, 36, 0.3))';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
          <span className="fw-bold text-gradient">iBhakt</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle navigation"
          style={{ border: 'none', padding: '4px 8px', color: 'var(--text-primary)' }}
        >
          <i className={`bi ${isNavOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '1.5rem' }}></i>
        </button>

        <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/" onClick={closeNav}>
                {t('nav.home')}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/kundli' ? 'active' : ''}`} to="/kundli" onClick={closeNav}>
                {t('nav.kundli')}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/manifestation' ? 'active' : ''}`} to="/manifestation" onClick={closeNav}>
                {t('nav.manifestation')}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/karma-ledger' ? 'active' : ''}`} to="/karma-ledger" onClick={closeNav}>
                {t('nav.karma')}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`} to="/pricing" onClick={closeNav}>
                {t('nav.pricing')}
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              className="btn btn-link p-2"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{ display: 'none', color: 'var(--text-primary)', border: 'none' }}
            >
              {theme === 'light' ? (
                <i className="bi bi-moon-stars-fill" style={{ fontSize: '1.25rem' }}></i>
              ) : (
                <i className="bi bi-sun-fill" style={{ fontSize: '1.25rem' }}></i>
              )}
            </button>

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="btn btn-link text-decoration-none d-flex align-items-center gap-2"
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{ color: 'var(--text-primary)', border: 'none' }}
                >
                  <i className="bi bi-person-circle" style={{ fontSize: '1.5rem' }}></i>
                  <i className="bi bi-chevron-down" style={{ fontSize: '0.75rem' }}></i>
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end ${isUserMenuOpen ? 'show' : ''}`}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: '220px',
                    marginTop: '0.5rem',
                  }}
                >
                  <li>
                    <Link className="dropdown-item" to="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                      <i className="bi bi-compass me-2"></i>
                      {t('nav.myKundli')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/manifestation" onClick={() => setIsUserMenuOpen(false)}>
                      <i className="bi bi-heart-pulse me-2"></i>
                      {t('nav.myManifestation')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/pricing" onClick={() => setIsUserMenuOpen(false)}>
                      <i className="bi bi-wallet2 me-2"></i>
                      {t('nav.myOrders')}
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" style={{ borderColor: 'var(--card-border)' }} />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      {t('nav.logout')}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/" className="btn btn-cosmic-outline btn-sm d-none d-md-inline-block">
                  {t('nav.login')}
                </Link>
                <Link to="/" className="btn btn-cosmic btn-sm">
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

