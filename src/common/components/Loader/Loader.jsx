import styles from './Loader.module.css';

function Loader({ size = 'md', fullScreen = false }) {
  const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];
  const containerClass = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <div className={containerClass}>
      <div className={`${styles.spinner} ${sizeClass}`} role="status" aria-label="Loading">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

export default Loader;

