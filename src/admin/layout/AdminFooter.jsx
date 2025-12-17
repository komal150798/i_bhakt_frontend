import styles from './AdminFooter.module.css';

function AdminFooter() {
  const currentYear = new Date().getFullYear();
  const buildVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.copyright}>
          © {currentYear} I-Bhakt Admin. All rights reserved.
        </p>
        {buildVersion && (
          <p className={styles.version}>v{buildVersion}</p>
        )}
      </div>
    </footer>
  );
}

export default AdminFooter;
