import { useAuth } from '../../../common/hooks/useAuth';
import ThemeToggle from '../../../common/components/ThemeToggle/ThemeToggle';
import styles from './Topbar.module.css';

function Topbar({ onMenuToggle }) {
  const { user, logout } = useAuth();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.menuToggle}
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <i className="bi bi-list"></i>
        </button>
        <input
          type="search"
          className={styles.search}
          placeholder="Search..."
          aria-label="Search"
        />
      </div>
      <div className={styles.right}>
        <ThemeToggle />
        <div className={styles.userMenu}>
          <span className={styles.userName}>{user?.name || 'Admin'}</span>
          <button className={styles.logoutBtn} onClick={logout} aria-label="Logout">
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;

