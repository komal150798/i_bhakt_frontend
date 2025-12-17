import { useTheme } from '../../../context/ThemeContext';
import styles from './ThemeToggle.module.css';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
    </button>
  );
}

export default ThemeToggle;
