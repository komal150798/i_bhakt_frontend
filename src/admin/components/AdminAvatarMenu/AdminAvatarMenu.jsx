import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../common/context/AdminAuthContext';
import styles from './AdminAvatarMenu.module.css';

function AdminAvatarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getInitials = () => {
    if (!adminUser) return 'A';
    const name = adminUser.name || adminUser.email || 'Admin';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  const handleViewProfile = () => {
    navigate('/admin/profile');
    setIsOpen(false);
  };

  if (!adminUser) {
    return null;
  }

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Admin menu"
      >
        {adminUser.avatar_url ? (
          <img
            src={adminUser.avatar_url}
            alt={adminUser.name || 'Admin'}
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarInitials}>{getInitials()}</div>
        )}
        <i className={`bi bi-chevron-down ${styles.chevron} ${isOpen ? styles.open : ''}`}></i>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{adminUser.name || adminUser.email}</div>
            <div className={styles.userEmail}>{adminUser.email}</div>
            <div className={styles.userRole}>
              {adminUser.role === 'super_admin' ? 'Super Admin' : 
               adminUser.role === 'admin' ? 'Admin' : 
               adminUser.role || 'User'}
            </div>
          </div>

          <div className={styles.divider}></div>

          <button
            className={styles.menuItem}
            onClick={handleViewProfile}
          >
            <i className="bi bi-person"></i>
            <span>View Profile</span>
          </button>

          <div className={styles.divider}></div>

          <button
            className={`${styles.menuItem} ${styles.logoutItem}`}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminAvatarMenu;

