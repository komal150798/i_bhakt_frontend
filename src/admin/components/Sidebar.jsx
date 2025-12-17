import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const MENU_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/admin/users', label: 'Users', icon: 'bi-people' },
  { path: '/admin/content', label: 'Content', icon: 'bi-file-text' },
  { path: '/admin/settings', label: 'Settings', icon: 'bi-gear' },
];

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Link to="/admin">AstroVerse Admin</Link>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
              >
                <i className={`bi ${item.icon} ${styles.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

