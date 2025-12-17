import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from '../components/NotificationDropdown/NotificationDropdown';
import AdminAvatarMenu from '../components/AdminAvatarMenu/AdminAvatarMenu';
import styles from './AdminHeader.module.css';

function AdminHeader({ onMenuToggle }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Set page title based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/users')) setPageTitle('Users');
    else if (path.includes('/roles')) setPageTitle('Roles & Permissions');
    else if (path.includes('/karma')) setPageTitle('Karma Overview');
    else if (path.includes('/templates')) setPageTitle('Templates');
    else if (path.includes('/settings')) setPageTitle('Settings');
    else if (path.includes('/profile')) setPageTitle('Profile');
    else setPageTitle('Dashboard');
  }, [location]);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button 
          className={styles.menuToggle}
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <i className="bi bi-list"></i>
        </button>
        <div className={styles.logo}>
          <img src="/ibhakt_logo.jpeg" alt="I-Bhakt" className={styles.logoImage} />
          <span className={styles.logoText}>I-Bhakt Admin</span>
        </div>
        <div className={styles.pageTitle}>{pageTitle}</div>
      </div>

      <div className={styles.right}>
        {/* Theme Toggle */}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <i className="bi bi-moon-stars-fill"></i>
          ) : (
            <i className="bi bi-sun-fill"></i>
          )}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Admin Avatar Menu */}
        <AdminAvatarMenu />
      </div>
    </header>
  );
}

export default AdminHeader;
