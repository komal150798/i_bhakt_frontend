import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext();

const TOKEN_STORAGE_KEY = 'ibhakt_token';
const REFRESH_TOKEN_STORAGE_KEY = 'ibhakt_refresh_token';
const USER_STORAGE_KEY = 'ibhakt_user';
const PROFILE_STORAGE_KEY = 'ibhakt_profile';
const USER_ID_STORAGE_KEY = 'ibhakt_user_id';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [profile, setProfileState] = useState(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [userId, setUserIdState] = useState(() => {
    const raw = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  /** Seeds dashboard `userId` / `profile` from login user payload (matches legacy AuthContext.tsx behavior). */
  const seedDashboardAuth = useCallback((userData) => {
    if (!userData || typeof userData !== 'object') return;
    const idNum = Number(userData.id);
    if (Number.isFinite(idNum) && idNum > 0) {
      setUserIdState((prev) => {
        if (prev != null) return prev;
        localStorage.setItem(USER_ID_STORAGE_KEY, String(idNum));
        return idNum;
      });
    }
    setProfileState((prev) => {
      if (prev) return prev;
      const next = {
        fullName: userData.full_name || userData.name || userData.fullName,
        email: userData.email,
        phoneNumber: userData.phone_number || userData.phoneNumber,
        dateOfBirth: userData.date_of_birth || userData.dateOfBirth,
        timeOfBirth: userData.time_of_birth || userData.timeOfBirth,
        placeOfBirth: userData.place_of_birth || userData.placeOfBirth || userData.place_name,
        gender: userData.gender,
      };
      const hasAny = Object.values(next).some((v) => v != null && v !== '');
      if (!hasAny) return prev;
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setProfile = useCallback((value) => {
    setProfileState(value);
    if (value) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, []);

  const setUserId = useCallback((value) => {
    setUserIdState(value);
    if (value !== null && Number.isFinite(value)) {
      localStorage.setItem(USER_ID_STORAGE_KEY, String(value));
    } else {
      localStorage.removeItem(USER_ID_STORAGE_KEY);
    }
  }, []);

  /** Public: sync token + storage; `null` clears session (dashboard + legacy keys). */
  const setToken = useCallback((value) => {
    setTokenState(value);
    if (value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
      return;
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setProfileState(null);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    setUserIdState(null);
    localStorage.removeItem(USER_ID_STORAGE_KEY);
  }, []);

  /**
   * Load authentication state from localStorage on app startup
   */
  const loadFromStorage = useCallback(async () => {
    // Prevent double call from React StrictMode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Set stored user immediately for instant UI (no flash)
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setTokenState(storedToken);
          setUser(parsedUser);
          seedDashboardAuth(parsedUser);
        } catch (e) {
          // Invalid JSON, ignore
        }
      }

      // Validate token in background
      try {
        const userData = await authApi.getCurrentUser(storedToken);
        setTokenState(storedToken);
        setUser(userData);
        seedDashboardAuth(userData);
      } catch (error) {
        // Token is invalid or expired
        console.warn('Token validation failed:', error.message);
        setToken(null);
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [seedDashboardAuth, setToken]);

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
      setToken(null);
    }
  }, [token, setToken]);

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
      setTokenState(access_token);
      setUser(userData);
      seedDashboardAuth(userData);

      // Dispatch event to notify other auth contexts
      window.dispatchEvent(new Event('auth:login'));

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
      setTokenState(access_token);
      setUser(newUser);
      seedDashboardAuth(newUser);

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
      setTokenState(accessToken);
      setUser(userData);
      seedDashboardAuth(userData);

      // Dispatch event to notify other auth contexts
      window.dispatchEvent(new Event('auth:login'));

      // Debug: Verify state
      console.log('📊 Auth State Updated:', { hasToken: !!accessToken, hasUser: !!userData });
    },
    [seedDashboardAuth],
  );

  const value = {
    user,
    token,
    setToken,
    profile,
    setProfile,
    userId,
    setUserId,
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

