import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../common/hooks/useAuth';
import { useLanguage } from '../../common/i18n/LanguageContext';
import ThemeToggle from '../../common/components/ThemeToggle/ThemeToggle';
import { SUPPORTED_LANGUAGES } from '../../common/i18n/i18nConfig';
import styles from './HomeHeader.module.css';

const NAV_ITEMS = [
  { path: '/', key: 'nav.home' },
  { path: '/about', key: 'nav.aboutUs' },
  { path: '/kundli', key: 'nav.kundli' },
  { path: '/horoscope', key: 'nav.dailyHoroscope' },
  { path: '/karma', key: 'nav.karma' },
  { path: '/manifestation', key: 'nav.manifestation' },
  { path: '/services', key: 'nav.services' },
  { path: '/contact', key: 'nav.contact' },
];

function HomeHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, token } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Debug: Log auth state
  useEffect(() => {
    console.log('🏠 Header Auth State:', {
      hasUser: !!user,
      hasToken: !!token,
      isAuthenticated,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
    });
  }, [user, token, isAuthenticated]);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleViewProfile = () => {
    setIsUserMenuOpen(false);
    navigate('/profile');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.email || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
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

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.container}>
          {/* Logo - Left Side */}
          <Link to="/" className={styles.logo}>
            <img 
              src="/ibhakt_logo.jpeg" 
              alt="I-Bhakt Logo" 
              className={styles.logoImage}
            />
            <span className={styles.logoText}>I-Bhakt</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
          </button>

          {/* Navigation Links - Center */}
          <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.navListOpen : ''}`}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link
                  to={item.path}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side Actions */}
          <div className={`${styles.rightActions} ${isMobileMenuOpen ? styles.rightActionsOpen : ''}`}>
            {/* Language Selector */}
            <div className={styles.languageSelector}>
              <select
                className={styles.languageSelect}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <div style={{ display: 'none' }}>
              <ThemeToggle />
            </div>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className={styles.userIconWrapper} ref={userMenuRef}>
                <button
                  className={styles.userAvatar}
                  onClick={toggleUserMenu}
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {getUserInitials()}
                </button>
                {isUserMenuOpen && (
                  <div className={styles.userMenu}>
                    <div className={styles.userMenuHeader}>
                      <div className={styles.userMenuName}>{user.name || user.email}</div>
                      <div className={styles.userMenuEmail}>{user.email}</div>
                    </div>
                    <div className={styles.userMenuDivider}></div>
                    <button
                      className={styles.userMenuItem}
                      onClick={handleViewProfile}
                    >
                      <i className="bi bi-person"></i>
                      <span>View Profile</span>
                    </button>
                    <button
                      className={styles.userMenuItem}
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      <span>{t('common.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={styles.loginBtn}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/signup"
                  className={styles.signupBtn}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('common.signup')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default HomeHeader;
