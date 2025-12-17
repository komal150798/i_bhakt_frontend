import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../common/context/AdminAuthContext';
import { getVisibleModules } from '../config/adminModules';
import styles from './AdminSidebar.module.css';

function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { hasPermission, isSuperAdmin, adminUser, isLoading } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Get visible modules based on permissions (dynamic from adminModules registry)
  // Super admins see all modules, other admins see only what they have permission for
  // Use useMemo to recalculate when adminUser or permissions change
  const visibleMenuItems = useMemo(() => {
    if (isLoading || !adminUser) {
      return []; // Return empty array while loading
    }
    return getVisibleModules(hasPermission, isSuperAdmin);
  }, [hasPermission, isSuperAdmin, isLoading, adminUser]);
  
  // Debug logging
  useEffect(() => {
    console.log('AdminSidebar: adminUser:', adminUser);
    console.log('AdminSidebar: isSuperAdmin:', isSuperAdmin);
    console.log('AdminSidebar: isLoading:', isLoading);
    console.log('AdminSidebar: visibleMenuItems count:', visibleMenuItems.length);
    console.log('AdminSidebar: visibleMenuItems:', visibleMenuItems.map(m => m.label));
  }, [adminUser, isSuperAdmin, isLoading, visibleMenuItems]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [location, onClose]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          {!collapsed && (
            <div className={styles.logo}>
              <img src="/ibhakt_logo.jpeg" alt="I-Bhakt" className={styles.logoImage} />
              <span className={styles.logoText}>I-Bhakt</span>
            </div>
          )}
          <button
            className={styles.collapseToggle}
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Collapse sidebar"
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {visibleMenuItems.map((module) => {
              const modulePath = `/admin/${module.path}`;
              const isActive = location.pathname === modulePath || 
                              (modulePath !== '/admin/dashboard' && location.pathname.startsWith(modulePath)) ||
                              (location.pathname === '/admin' && modulePath === '/admin/dashboard');
              
              return (
                <li key={module.id}>
                  <Link
                    to={modulePath}
                    className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                    title={collapsed ? module.label : ''}
                  >
                    <i className={`bi ${module.icon}`}></i>
                    {!collapsed && <span>{module.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default AdminSidebar;

