/**
 * Karma API functions
 * Handles all karma-related API calls
 */

// VITE_API_URL already includes /api/v1
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const ENDPOINTS = {
  ADD_KARMA: '/customer/karma/add',
  GET_SUMMARY: '/customer/karma/user',
  GET_HABITS: '/customer/karma/user',
  GET_PATTERNS: '/customer/karma/user',
  GET_WEEKLY: '/customer/karma/user',
  GET_MONTHLY: '/customer/karma/user',
};

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('ibhakt_token');
}

/**
 * Add a new karma action
 * Uses new /app/karma/input endpoint
 * @param {Object} karmaData - { action_text, timestamp? }
 * @returns {Promise<Object>} Created karma entry
 */
export async function addKarmaAction(karmaData) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  // Try new app endpoint first
  try {
    const response = await fetch(`${BASE_URL}/app/karma/input`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action_text: karmaData.action_text,
        timestamp: karmaData.timestamp || new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.data || responseData;
    }
  } catch (error) {
    console.warn('New karma input endpoint failed, trying legacy endpoint:', error);
  }

  // Fallback to legacy endpoint
  const response = await fetch(`${BASE_URL}${ENDPOINTS.ADD_KARMA}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action_text: karmaData.action_text,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add karma action' }));
    throw new Error(error.message || 'Failed to add karma action');
  }

  const responseData = await response.json();
  // Handle nested response structure
  const data = responseData.data || responseData;
  return data;
}

/**
 * Get karma dashboard summary for authenticated user
 * Uses new /app/karma/dashboard endpoint with streak data
 * @returns {Promise<Object>} Karma dashboard data with streak information
 */
export async function getKarmaDashboard() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  // Try new app endpoint first
  try {
    const response = await fetch(`${BASE_URL}/app/karma/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData.data || responseData;
    }
  } catch (error) {
    console.warn('New karma dashboard endpoint failed, trying legacy endpoint:', error);
  }

  // Fallback to legacy endpoint
  const response = await fetch(`${BASE_URL}/customer/karma/dashboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get karma dashboard' }));
    throw new Error(error.message || 'Failed to get karma dashboard');
  }

  const responseData = await response.json();
  const data = responseData.data || responseData;
  return data;
}

/**
 * Get karma summary for a user
 * @param {number} userId - User ID (optional, defaults to authenticated user)
 * @returns {Promise<Object>} Karma summary
 */
export async function getKarmaSummary(userId) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  // If userId is provided, send it; otherwise backend will use authenticated user's ID
  const body = userId ? { user_id: userId } : {};

  const response = await fetch(`${BASE_URL}/customer/karma/user/summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get karma summary' }));
    throw new Error(error.message || 'Failed to get karma summary');
  }

  const responseData = await response.json();
  const data = responseData.data || responseData;
  return data;
}

/**
 * Get habit recommendations for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Habit recommendations
 */
export async function getHabitRecommendations(userId) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${BASE_URL}/customer/karma/user/habits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get habit recommendations' }));
    throw new Error(error.message || 'Failed to get habit recommendations');
  }

  const responseData = await response.json();
  const data = responseData.data || responseData;
  return data;
}

/**
 * Get karma patterns for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Pattern analysis
 */
export async function getKarmaPatterns(userId) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${BASE_URL}/customer/karma/user/patterns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get karma patterns' }));
    throw new Error(error.message || 'Failed to get karma patterns');
  }

  const responseData = await response.json();
  const data = responseData.data || responseData;
  return data;
}

