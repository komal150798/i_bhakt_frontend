import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from './ToastContainer';

const ToastContext = createContext(undefined);

/**
 * Toast configuration
 */
export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

export const ToastPositions = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
};

/**
 * Toast item structure
 */
export const createToast = (type, message, options = {}) => {
  const {
    title,
    description,
    duration = 4000,
    actionLabel,
    onActionClick,
    position = ToastPositions.TOP_RIGHT,
  } = options;

  return {
    id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    description,
    duration,
    actionLabel,
    onActionClick,
    position,
    createdAt: Date.now(),
  };
};

/**
 * Toast Provider Component
 * Manages global toast state and provides toast functions
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast
   */
  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, toast]);
  }, []);

  /**
   * Remove a toast by ID
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Show success toast
   */
  const showSuccess = useCallback(
    (message, options = {}) => {
      const toast = createToast(ToastTypes.SUCCESS, message, options);
      addToast(toast);
    },
    [addToast],
  );

  /**
   * Show error toast
   */
  const showError = useCallback(
    (message, options = {}) => {
      const toast = createToast(ToastTypes.ERROR, message, options);
      addToast(toast);
    },
    [addToast],
  );

  /**
   * Show info toast
   */
  const showInfo = useCallback(
    (message, options = {}) => {
      const toast = createToast(ToastTypes.INFO, message, options);
      addToast(toast);
    },
    [addToast],
  );

  /**
   * Show warning toast
   */
  const showWarning = useCallback(
    (message, options = {}) => {
      const toast = createToast(ToastTypes.WARNING, message, options);
      addToast(toast);
    },
    [addToast],
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast context
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}


