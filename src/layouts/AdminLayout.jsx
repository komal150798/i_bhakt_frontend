import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar/Sidebar';
import Topbar from '../components/admin/Topbar/Topbar';
import styles from './AdminLayout.module.css';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const sidebar = document.querySelector('[class*="sidebar"]');
    if (sidebar) {
      if (sidebarOpen) {
        sidebar.classList.add('open');
      } else {
        sidebar.classList.remove('open');
      }
    }
  }, [sidebarOpen]);

  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Topbar onMenuToggle={toggleSidebar} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;

