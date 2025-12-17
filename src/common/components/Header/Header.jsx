import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/kundli', label: 'Kundli' },
  { path: '/horoscope', label: 'Daily Horoscope' },
  { path: '/refer', label: 'Refer & Earn' },
];

function Header() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.header}>
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className={`navbar-brand ${styles.logo}`} to="/">
            AstroVerse
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              {NAV_ITEMS.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    className={`nav-link ${isActive(item.path) ? styles.active : ''}`}
                    to={item.path}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.rightActions}>
              <ThemeToggle />
              {isAuthenticated ? (
                <button className="btn btn-outline-primary btn-sm" onClick={logout}>
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-primary btn-sm">
                    Login
                  </Link>
                  <Link to="/signup" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

