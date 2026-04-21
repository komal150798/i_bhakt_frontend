import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../common/hooks/useAuth';
import { useLanguage } from '../../common/i18n/LanguageContext';
import styles from './HomeHeader.module.css';

const NAV_ITEMS = [
  { path: '/', key: 'nav.home', icon: 'bi-house' },
  { path: '/about', key: 'nav.aboutUs', icon: 'bi-info-circle' },
  // { path: '/kundli', key: 'nav.kundli', icon: 'bi-stars' }, // Hidden
  // { path: '/horoscope', key: 'nav.dailyHoroscope', icon: 'bi-calendar' }, // Hidden
  { path: '/karma', key: 'nav.karma', icon: 'bi-yin-yang' },
  { path: '/manifestations', key: 'nav.manifestation', icon: 'bi-magic' },
  // { path: '/services', key: 'nav.services', icon: 'bi-grid' }, // Hidden
  { path: '/contact', key: 'nav.contact', icon: 'bi-envelope' },
];

function HomeHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isDrawerOpen]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    setIsDrawerOpen(false);
    navigate('/');
  };

  const handleViewProfile = () => {
    setIsUserMenuOpen(false);
    setIsDrawerOpen(false);
    navigate('/profile');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.email || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  // Close user menu on outside click (desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <img src="/ibhakt_logo.jpeg" alt="iBhakt logo" className={styles.logoImage} />
            <span className={`${styles.logoText} brand-mark`}>iBhakt</span>
          </Link>

          {/* Desktop Nav */}
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link
                  to={item.path}
                  className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Right Actions */}
          <div className={styles.rightActions}>
            {isAuthenticated && user ? (
              <div className={styles.userIconWrapper} ref={userMenuRef}>
                <button
                  className={styles.userAvatar}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User menu"
                >
                  {getUserInitials()}
                </button>
                {isUserMenuOpen && (
                  <div className={styles.userMenu}>
                    <div className={styles.userMenuHeader}>
                      <div className={styles.userMenuName}>{user.name || user.email}</div>
                      <div className={styles.userMenuEmail}>{user.email}</div>
                    </div>
                    <div className={styles.userMenuDivider} />
                    <button className={styles.userMenuItem} onClick={handleViewProfile}>
                      <i className="bi bi-person" />
                      <span>View Profile</span>
                    </button>
                    <button className={styles.userMenuItem} onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right" />
                      <span>{t('common.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}>{t('common.login')}</Link>
                <Link to="/signup" className={styles.signupBtn}>{t('common.signup')}</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`${styles.mobileToggle} ${isDrawerOpen ? styles.mobileToggleOpen : ''}`}
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            aria-label="Toggle navigation"
            aria-expanded={isDrawerOpen}
          >
            <span className={styles.hamburger} />
            <span className={styles.hamburger} />
            <span className={styles.hamburger} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`${styles.overlay} ${isDrawerOpen ? styles.overlayVisible : ''}`}
        onClick={closeDrawer}
      />

      {/* Mobile Drawer */}
      <aside className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
        {/* Drawer Header - User Info */}
        <div className={styles.drawerHeader}>
          {isAuthenticated && user ? (
            <div className={styles.drawerUser}>
              <div className={styles.drawerAvatar}>{getUserInitials()}</div>
              <div className={styles.drawerUserInfo}>
                <div className={styles.drawerUserName}>{user.name || 'User'}</div>
                <div className={styles.drawerUserEmail}>{user.email}</div>
              </div>
            </div>
          ) : (
            <div className={styles.drawerBrand}>
              <img src="/ibhakt_logo.jpeg" alt="iBhakt" className={styles.drawerLogo} />
              <span className={styles.drawerBrandText}>iBhakt</span>
            </div>
          )}
          <button className={styles.drawerClose} onClick={closeDrawer} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <nav className={styles.drawerNav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.drawerLink} ${isActive(item.path) ? styles.drawerLinkActive : ''}`}
              onClick={closeDrawer}
            >
              <i className={`bi ${item.icon} ${styles.drawerLinkIcon}`} />
              <span>{t(item.key)}</span>
              {isActive(item.path) && <div className={styles.drawerActiveBar} />}
            </Link>
          ))}
        </nav>

        {/* Drawer Divider */}
        <div className={styles.drawerDivider} />

        {/* Drawer Auth / Profile Actions */}
        <div className={styles.drawerActions}>
          {isAuthenticated && user ? (
            <>
              <button className={styles.drawerActionBtn} onClick={handleViewProfile}>
                <i className="bi bi-person-circle" />
                <span>View Profile</span>
              </button>
              <button className={`${styles.drawerActionBtn} ${styles.drawerLogoutBtn}`} onClick={handleLogout}>
                <i className="bi bi-box-arrow-right" />
                <span>{t('common.logout')}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.drawerLoginBtn} onClick={closeDrawer}>
                {t('common.login')}
              </Link>
              <Link to="/signup" className={styles.drawerSignupBtn} onClick={closeDrawer}>
                {t('common.signup')}
              </Link>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className={styles.drawerFooter}>
          <p>&copy; {new Date().getFullYear()} iBhakt</p>
        </div>
      </aside>
    </header>
  );
}

export default HomeHeader;
