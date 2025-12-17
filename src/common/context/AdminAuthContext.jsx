/**
 * Admin Auth Context
 * Separate context for admin authentication using admin_token
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AdminAuthContext = createContext();

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
const ADMIN_INFO_KEY = 'admin_info';

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load admin auth from localStorage
   */
  const loadAdminAuth = useCallback(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const userStr = localStorage.getItem(ADMIN_INFO_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Ensure is_master is properly converted to boolean
        if (user.is_master !== undefined) {
          user.is_master = user.is_master === true || user.is_master === 'true' || user.is_master === 1;
        }
        console.log('AdminAuthContext: Loaded user from localStorage:', user);
        console.log('AdminAuthContext: isSuperAdmin check:', user.role === 'super_admin' || user.is_master === true);
        setAdminToken(token);
        setAdminUser(user);
      } catch (error) {
        console.error('Error parsing admin info:', error);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
        localStorage.removeItem(ADMIN_INFO_KEY);
      }
    } else {
      setAdminToken(null);
      setAdminUser(null);
    }
  }, []);

  useEffect(() => {
    loadAdminAuth();
    setIsLoading(false);
    
    // Listen for storage changes (when login page updates localStorage)
    const handleStorageChange = (e) => {
      if (e.key === ADMIN_INFO_KEY || e.key === ADMIN_TOKEN_KEY) {
        console.log('AdminAuthContext: Storage changed, reloading auth');
        loadAdminAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (for same-tab updates)
    const handleCustomStorageChange = () => {
      console.log('AdminAuthContext: Custom storage event, reloading auth');
      loadAdminAuth();
    };
    
    window.addEventListener('adminAuthUpdate', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminAuthUpdate', handleCustomStorageChange);
    };
  }, [loadAdminAuth]);

  /**
   * Set admin auth after login
   */
  const setAdminAuth = useCallback((token, refreshToken, user) => {
    // Ensure is_master is properly converted to boolean
    if (user && user.is_master !== undefined) {
      user.is_master = user.is_master === true || user.is_master === 'true' || user.is_master === 1;
    }
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
    }
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
    // Dispatch event for other components
    window.dispatchEvent(new Event('adminAuthUpdate'));
  }, []);

  /**
   * Logout admin
   */
  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_INFO_KEY);
    setAdminToken(null);
    setAdminUser(null);
    window.location.href = '/admin/login';
  }, []);

  /**
   * Check if user is admin
   */
  const isAdmin = useMemo(() => {
    return adminUser && adminToken && (
      adminUser.role === 'admin' || 
      adminUser.role === 'super_admin' || 
      adminUser.role === 'ops'
    );
  }, [adminUser, adminToken]);

  /**
   * Check if user is super admin
   * Super admins have FULL ACCESS - no permission checks needed
   * Even if backend doesn't send permissions array, super_admin role = full access
   * 
   * Checks:
   * 1. role === 'super_admin' (for backward compatibility)
   * 2. is_master === true (from adm_role.is_master field in database)
   */
  const isSuperAdmin = useMemo(() => {
    if (!adminUser) return false;
    // Check if role is super_admin OR if is_master flag is true
    return adminUser.role === 'super_admin' || adminUser.is_master === true;
  }, [adminUser]);

  /**
   * Get permissions from user object
   */
  const permissions = useMemo(() => {
    return adminUser?.permissions || [];
  }, [adminUser]);

  /**
   * Check if user has specific permission
   * 
   * SUPER ADMIN: ALWAYS returns true (full access, no permission checks)
   * OTHER ADMINS: Checked against their permissions array from backend
   */
  const hasPermission = useCallback((permissionCode) => {
    if (!adminUser) return false;
    
    // SUPER ADMIN = FULL ACCESS (always return true, no checks needed)
    // Even if backend doesn't send permissions array, super_admin has all access
    if (isSuperAdmin) {
      return true;
    }
    
    // For other admins, check permissions array from backend
    return permissions.includes(permissionCode);
  }, [adminUser, permissions, isSuperAdmin]);

  const value = {
    adminUser,
    adminToken,
    isLoading,
    isAdmin,
    isSuperAdmin,
    permissions,
    hasPermission,
    setAdminAuth,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

