/**
 * Horoscope API functions
 * Handles all horoscope-related API calls
 */

// VITE_API_URL already includes /api/v1
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('ibhakt_token');
}

/**
 * Get horoscope for a zodiac sign (public, with optional authentication)
 * @param {string|null} sign - Zodiac sign (Aries, Taurus, etc.) or null for personalized
 * @param {string} type - Type of horoscope (daily, weekly, monthly)
 * @returns {Promise<Object>} Horoscope data
 */
export async function getHoroscope(sign, type = 'daily') {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  // Always send token if available (backend will use it for personalized horoscope if sign is null)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const body = {
    type,
  };

  // Only include sign if provided (if null, backend will use user's birth date)
  if (sign) {
    body.sign = sign;
  }

  const response = await fetch(`${BASE_URL}/horoscope`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get horoscope' }));
    throw new Error(error.message || 'Failed to get horoscope');
  }

  const responseData = await response.json();
  const data = responseData.data || responseData;
  return data;
}

/**
 * Get personalized horoscope for authenticated user
 * @param {string} type - Type of horoscope (daily, weekly, monthly)
 * @returns {Promise<Object>} Personalized horoscope data
 */
export async function getMyHoroscope(type = 'daily') {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${BASE_URL}/horoscope/my`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get personalized horoscope' }));
    throw new Error(error.message || 'Failed to get personalized horoscope');
  }

  const responseData = await response.json();
  const data = responseData.data || responseData;
  return data;
}

/**
 * Get daily horoscope
 * @param {string} sign - Zodiac sign
 * @returns {Promise<Object>} Daily horoscope
 */
export async function getDailyHoroscope(sign) {
  return getHoroscope(sign, 'daily');
}

/**
 * Get weekly horoscope
 * @param {string} sign - Zodiac sign
 * @returns {Promise<Object>} Weekly horoscope
 */
export async function getWeeklyHoroscope(sign) {
  return getHoroscope(sign, 'weekly');
}

/**
 * Get monthly horoscope
 * @param {string} sign - Zodiac sign
 * @returns {Promise<Object>} Monthly horoscope
 */
export async function getMonthlyHoroscope(sign) {
  return getHoroscope(sign, 'monthly');
}

