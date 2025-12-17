/**
 * Authentication API Client
 * Handles all authentication-related API calls
 */

// Base URL - VITE_API_URL already includes /api/v1 (e.g., http://localhost:3000/api/v1)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// API Endpoints - include full path from base URL
const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  GET_CURRENT_USER: '/auth/me',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  OTP_SEND: '/auth/otp/send',
  OTP_VERIFY: '/auth/otp/verify',
  GOOGLE_LOGIN: '/auth/google',
};

/**
 * Login user with email/username and password
 * @param {Object} credentials - { username (or email), password }
 * @returns {Promise<{access_token: string, refresh_token: string, user: Object}>}
 */
export async function login(credentials) {
  // Backend expects 'username' field (can be email or phone)
  const loginData = {
    username: credentials.email || credentials.username || credentials.phone_number,
    password: credentials.password,
  };

  const response = await fetch(`${BASE_URL}${ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }

  const responseData = await response.json();
  
  // Handle nested response structure: { success: true, data: { access_token, refresh_token, user } }
  // or flat structure: { access_token, refresh_token, user }
  const data = responseData.data || responseData;
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user || data,
  };
}

/**
 * Register a new user
 * @param {Object} userData - { name, email, password, phone_number (optional) }
 * @returns {Promise<{access_token: string, refresh_token: string, user: Object}>}
 */
export async function register(userData) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.REGISTER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed. Please try again.');
  }

  const responseData = await response.json();
  
  // Handle nested response structure
  const data = responseData.data || responseData;
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user || data,
  };
}

/**
 * Get current user using stored token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User object
 */
export async function getCurrentUser(token) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.GET_CURRENT_USER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid or expired token');
    }
    const error = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
    throw new Error(error.message || 'Failed to fetch user information');
  }

  const responseData = await response.json();
  const data = responseData.data || responseData;
  return data.user || data;
}

/**
 * Refresh authentication token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<{token: string}>}
 */
export async function refreshToken(refreshToken) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  return {
    token: data.token || data.access_token,
  };
}

/**
 * Logout user (optional - if backend has logout endpoint)
 * @param {string} accessToken - Access token for Authorization header
 * @param {string} refreshToken - Refresh token to invalidate (required in body)
 */
export async function logout(accessToken, refreshToken) {
  try {
    if (!refreshToken) {
      console.warn('No refresh token provided for logout');
      return;
    }

    const response = await fetch(`${BASE_URL}${ENDPOINTS.LOGOUT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Logout failed' }));
      throw new Error(error.message || 'Logout failed');
    }

    return response.json();
  } catch (error) {
    // Ignore errors on logout - token will be cleared client-side anyway
    console.warn('Logout API call failed:', error);
    throw error;
  }
}

/**
 * Login with username/email and password
 * @param {Object} credentials - { username, password }
 * @returns {Promise<{access_token: string, refresh_token: string, user: Object}>}
 */
export async function loginWithPassword(credentials) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }

  const responseData = await response.json();
  
  // Handle nested response structure
  const data = responseData.data || responseData;
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user,
  };
}

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<{message: string, debug_code?: string}>}
 */
export async function sendOtp(phoneNumber) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.OTP_SEND}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to send OTP' }));
    throw new Error(error.message || 'Failed to send OTP. Please try again.');
  }

  return response.json();
}

/**
 * Verify OTP and login
 * @param {Object} data - { phone_number, otp_code }
 * @returns {Promise<{access_token: string, refresh_token: string, user: Object}>}
 */
export async function verifyOtp(data) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.OTP_VERIFY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: data.phone_number,
      otp_code: data.otp_code,
      is_login: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'OTP verification failed' }));
    throw new Error(error.message || 'Invalid or expired OTP. Please try again.');
  }

  const responseData = await response.json();
  
  // Handle nested response structure
  const result = responseData.data || responseData;
  
  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    user: result.user,
  };
}

/**
 * Login with Google ID token
 * @param {string} idToken - Google ID token
 * @returns {Promise<{access_token: string, refresh_token: string, user: Object}>}
 */
export async function loginWithGoogle(idToken) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.GOOGLE_LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Google login failed' }));
    throw new Error(error.message || 'Google login failed. Please try again.');
  }

  const responseData = await response.json();
  
  // Handle nested response structure
  const data = responseData.data || responseData;
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user,
  };
}

