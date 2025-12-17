import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { token, setToken, setUserId, setProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const isAuthenticated = !!token || !!localStorage.getItem('ibhakt_token');
  const isAdmin = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    localStorage.removeItem('ibhakt_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUserId(null);
    setProfile(null);
    navigate('/');
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg glass-nav fixed-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeNav}>
          <i className="bi bi-stars me-2" style={{ fontSize: '1.5rem', color: 'var(--cosmic-purple)' }}></i>
          <span className="fw-bold text-gradient">iBhakt</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNav}
          aria-controls="navbarNav"
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
          style={{ 
            border: 'none', 
            padding: '4px 8px',
            color: 'var(--text-primary)'
          }}
        >
          <i className={`bi ${isNavOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '1.5rem' }}></i>
        </button>

        <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/" onClick={closeNav}>
                Home
              </Link>
            </li>
            {isAuthenticated && !isAdmin && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard" onClick={closeNav}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/karma-ledger' ? 'active' : ''}`} to="/karma-ledger" onClick={closeNav}>
                    Karma Ledger
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/manifestation' ? 'active' : ''}`} to="/manifestation" onClick={closeNav}>
                    Manifestation
                  </Link>
                </li>
              </>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`} to="/admin/dashboard" onClick={closeNav}>
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle */}
            <button
              className="btn btn-link p-2"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{ color: 'var(--text-primary)', border: 'none' }}
            >
              {theme === 'light' ? (
                <i className="bi bi-moon-stars-fill" style={{ fontSize: '1.25rem' }}></i>
              ) : (
                <i className="bi bi-sun-fill" style={{ fontSize: '1.25rem' }}></i>
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <button className="btn btn-cosmic-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                {!isAdmin && (
                  <Link to="/" className="btn btn-cosmic btn-sm" onClick={closeNav}>
                    Get Started
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
