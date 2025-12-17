/**
 * HTTP Client with automatic token injection
 * All API calls should use this client to automatically include auth tokens
 */

// Base URL - VITE_API_URL already includes /api/v1 (e.g., http://localhost:3000/api/v1)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Get stored token from localStorage
 */
function getToken() {
  return localStorage.getItem('ibhakt_token');
}

/**
 * Make authenticated API request
 * Automatically includes Authorization header if token exists
 */
export async function apiRequest(url, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid - clear it
      localStorage.removeItem('ibhakt_token');
      localStorage.removeItem('ibhakt_user');
      // Optionally trigger logout event
      window.dispatchEvent(new Event('auth:logout'));
    }
    
    const error = await response.json().catch(() => ({ 
      message: `Request failed with status ${response.status}` 
    }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

/**
 * GET request
 */
export async function get(url, options = {}) {
  return apiRequest(url, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function post(url, data, options = {}) {
  return apiRequest(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function put(url, data, options = {}) {
  return apiRequest(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function del(url, options = {}) {
  return apiRequest(url, { ...options, method: 'DELETE' });
}

