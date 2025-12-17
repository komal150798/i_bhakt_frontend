/**
 * useAuth Hook
 * Convenience hook for accessing authentication context
 * Re-exports from AuthContext for easier imports
 */
import { useAuth as useAuthContext } from '../context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
