import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

/**
 * Toast Item Component
 * Individual toast notification with auto-dismiss
 */
function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after duration
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    // Wait for exit animation before removing
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const handleActionClick = () => {
    if (toast.onActionClick) {
      toast.onActionClick();
    }
    handleClose();
  };

  // Get icon based on type
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
            <path
              d="M6 10L9 13L14 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
            <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
            <path d="M10 6V11M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
            <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon Section */}
      <div className={styles.iconSection}>{getIcon()}</div>

      {/* Content Section */}
      <div className={styles.contentSection}>
        {toast.title && <div className={styles.title}>{toast.title}</div>}
        <div className={styles.message}>{toast.message}</div>
        {toast.description && <div className={styles.description}>{toast.description}</div>}
        {toast.actionLabel && (
          <button className={styles.actionButton} onClick={handleActionClick} type="button">
            {toast.actionLabel}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button className={styles.closeButton} onClick={handleClose} type="button" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default ToastItem;


