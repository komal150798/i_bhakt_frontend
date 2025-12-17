import { useMemo } from 'react';
import ToastItem from './ToastItem';
import styles from './Toast.module.css';

/**
 * ToastContainer Component
 * Groups toasts by position and renders them
 */
function ToastContainer({ toasts, onRemove }) {
  // Group toasts by position
  const toastsByPosition = useMemo(() => {
    const grouped = {
      'top-right': [],
      'top-left': [],
      'bottom-right': [],
      'bottom-left': [],
    };

    toasts.forEach((toast) => {
      if (grouped[toast.position]) {
        grouped[toast.position].push(toast);
      } else {
        // Default to top-right if invalid position
        grouped['top-right'].push(toast);
      }
    });

    return grouped;
  }, [toasts]);

  return (
    <>
      {/* Top Right */}
      {toastsByPosition['top-right'].length > 0 && (
        <div className={`${styles.container} ${styles.topRight}`}>
          {toastsByPosition['top-right'].map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </div>
      )}

      {/* Top Left */}
      {toastsByPosition['top-left'].length > 0 && (
        <div className={`${styles.container} ${styles.topLeft}`}>
          {toastsByPosition['top-left'].map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </div>
      )}

      {/* Bottom Right */}
      {toastsByPosition['bottom-right'].length > 0 && (
        <div className={`${styles.container} ${styles.bottomRight}`}>
          {toastsByPosition['bottom-right'].map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </div>
      )}

      {/* Bottom Left */}
      {toastsByPosition['bottom-left'].length > 0 && (
        <div className={`${styles.container} ${styles.bottomLeft}`}>
          {toastsByPosition['bottom-left'].map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </div>
      )}
    </>
  );
}

export default ToastContainer;


