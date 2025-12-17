import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  // Apply admin theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', `admin-${theme}`);
    return () => {
      // Cleanup: restore default theme when leaving admin
      document.documentElement.setAttribute('data-theme', theme);
    };
  }, [theme]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className={styles.mainContent}>
        <AdminHeader onMenuToggle={toggleSidebar} />
        <main className={styles.content}>
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}

export default AdminLayout;
