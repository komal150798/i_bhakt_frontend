/**
 * useToast Hook
 * Convenience hook for accessing toast context
 * Re-exports from ToastProvider for easier imports
 */
import { useToast as useToastContext } from '../components/Toast/ToastProvider';

export function useToast() {
  return useToastContext();
}


