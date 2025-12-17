/**
 * Customer API Client
 * Handles all customer profile-related API calls
 */

// VITE_API_URL already includes /api/v1
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const ENDPOINTS = {
  GET_PROFILE: '/customer/profile',
  UPDATE_PROFILE: '/customer/profile',
};

/**
 * Get customer profile
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Customer profile object
 */
export async function getCustomerProfile(token) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.GET_PROFILE}`, {
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
    const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
    throw new Error(error.message || 'Failed to fetch profile');
  }

  const responseData = await response.json();
  return responseData.data || responseData;
}

/**
 * Update customer profile
 * @param {string} token - JWT token
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile object
 */
export async function updateCustomerProfile(token, profileData) {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.UPDATE_PROFILE}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    throw new Error(error.message || 'Failed to update profile');
  }

  const responseData = await response.json();
  return responseData.data || responseData;
}



