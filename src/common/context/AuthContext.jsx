import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext();

const TOKEN_STORAGE_KEY = 'ibhakt_token';
const REFRESH_TOKEN_STORAGE_KEY = 'ibhakt_refresh_token';
const USER_STORAGE_KEY = 'ibhakt_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load authentication state from localStorage on app startup
   */
  const loadFromStorage = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Validate token by fetching current user
      try {
        const userData = await authApi.getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        // Token is invalid or expired
        console.warn('Token validation failed:', error.message);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Get tokens from localStorage or state
      const currentAccessToken = token || localStorage.getItem(TOKEN_STORAGE_KEY);
      const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

      // Call logout API if tokens exist
      if (currentAccessToken && currentRefreshToken) {
        try {
          await authApi.logout(currentAccessToken, currentRefreshToken);
        } catch (error) {
          // Log but don't throw - we'll clear local storage anyway
          console.warn('Logout API call failed:', error);
        }
      }
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      // Always clear localStorage and state, even if API call fails
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);

      // Clear state
      setToken(null);
      setUser(null);
    }
  }, [token]);

  /**
   * Login user with credentials
   * @param {Object} credentials - { email/username, password }
   */
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      // authApi.login already handles nested response structure
      const { access_token, refresh_token, user: userData } = await authApi.login(credentials);

      // Debug: Log what we received
      console.log('🔐 Login Response:', { 
        access_token: !!access_token, 
        refresh_token: !!refresh_token, 
        user: userData 
      });

      if (!access_token || !refresh_token || !userData) {
        console.error('❌ Missing required data:', { 
          access_token: !!access_token, 
          refresh_token: !!refresh_token, 
          user: !!userData 
        });
        throw new Error('Invalid login response: missing tokens or user data');
      }

      // Save to localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      // Debug: Verify storage
      console.log('💾 Stored in localStorage:', {
        token: localStorage.getItem(TOKEN_STORAGE_KEY) ? '✅' : '❌',
        refreshToken: localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ? '✅' : '❌',
        user: localStorage.getItem(USER_STORAGE_KEY) ? '✅' : '❌',
      });

      // Update state - this triggers re-render
      setToken(access_token);
      setUser(userData);

      // Debug: Verify state
      console.log('📊 Auth State Updated:', { 
        hasToken: !!access_token, 
        hasUser: !!userData,
        userDetails: userData 
      });

      return { access_token, refresh_token, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   * @param {Object} userData - { name, email, password, phone_number (optional) }
   */
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const { access_token, refresh_token, user: newUser } = await authApi.register(userData);

      // Save to localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

      // Update state
      setToken(access_token);
      setUser(newUser);

      return { access_token, refresh_token, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load auth state on mount
   */
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  /**
   * Listen for logout events from httpClient (401 errors)
   */
  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [logout]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!user && !!token;

  /**
   * Get user role
   */
  const role = user?.role || null;

  /**
   * Check if user is admin
   */
  const isAdmin = () => role === 'admin';

  /**
   * Check if user is regular user
   */
  const isUser = () => role === 'user' || role === null;

  /**
   * Login with tokens directly (for OTP/Google login flows)
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   * @param {Object} userData - User object
   */
  const loginWithTokens = useCallback(
    (accessToken, refreshToken, userData) => {
      // Debug: Log what we received
      console.log('🔐 LoginWithTokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, user: userData });

      // Save to localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      // Debug: Verify storage
      console.log('💾 Stored in localStorage:', {
        token: localStorage.getItem(TOKEN_STORAGE_KEY) ? '✅' : '❌',
        refreshToken: localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ? '✅' : '❌',
        user: localStorage.getItem(USER_STORAGE_KEY) ? '✅' : '❌',
      });

      // Update state
      setToken(accessToken);
      setUser(userData);

      // Debug: Verify state
      console.log('📊 Auth State Updated:', { hasToken: !!accessToken, hasUser: !!userData });
    },
    [],
  );

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    role,
    login,
    register,
    logout,
    loginWithTokens,
    isAdmin,
    isUser,
    loadFromStorage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

