/**
 * Manifestation API Service
 * Handles all manifestation-related API calls
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('ibhakt_token');
}

/**
 * Make authenticated API request
 */
async function apiRequest(url, options = {}) {
  const token = getAuthToken();

  if (!token) {
    console.error('Manifestation API: No token found in localStorage');
    throw new Error('Authentication token not found. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const fullUrl = `${BASE_URL}${url}`;
  console.log(`Manifestation API Request: ${options.method || 'GET'} ${fullUrl}`);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.error('Manifestation API: 401 Unauthorized - clearing tokens');
      localStorage.removeItem('ibhakt_token');
      localStorage.removeItem('ibhakt_refresh_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    const error = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`,
    }));
    console.error(`Manifestation API Error (${response.status}):`, error);
    throw new Error(error.message || error.detail || 'Request failed');
  }

  const data = await response.json();
  return data.data || data;
}

export const manifestationApi = {
  /**
   * Create a new manifestation
   * POST /api/v1/app/manifestation/add
   */
  createManifestation: async (manifestationData) => {
    return apiRequest('/app/manifestation/add', {
      method: 'POST',
      body: JSON.stringify(manifestationData),
    });
  },

  /**
   * Get dashboard data
   * GET /api/v1/app/manifestation/dashboard
   */
  getDashboard: async () => {
    return apiRequest('/app/manifestation/dashboard');
  },

  /**
   * Get manifestation by ID
   * GET /api/v1/app/manifestation/:id
   */
  getManifestationById: async (id) => {
    return apiRequest(`/app/manifestation/${id}`);
  },

  /**
   * Archive a manifestation
   * PUT /api/v1/app/manifestation/archive/:id
   */
  archiveManifestation: async (id) => {
    return apiRequest(`/app/manifestation/archive/${id}`, {
      method: 'PUT',
    });
  },

  /**
   * Lock/Unlock a manifestation
   * PUT /api/v1/app/manifestation/lock/:id
   */
  toggleLockManifestation: async (id) => {
    return apiRequest(`/app/manifestation/lock/${id}`, {
      method: 'PUT',
    });
  },

  /**
   * Get tips for a manifestation
   * GET /api/v1/app/manifestation/tips/:id
   */
  getTips: async (id) => {
    return apiRequest(`/app/manifestation/tips/${id}`);
  },

  /**
   * Get all manifestations (including archived)
   * GET /api/v1/app/manifestation/list/all
   */
  getAllManifestations: async () => {
    return apiRequest('/app/manifestation/list/all');
  },

  /**
   * Calculate detailed resonance score with Dasha analysis
   * POST /api/v1/app/manifestation/calculate-resonance
   */
  calculateResonance: async (description) => {
    return apiRequest('/app/manifestation/calculate-resonance', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  },
};


