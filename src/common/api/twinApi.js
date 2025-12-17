/**
 * Digital Twin API functions
 * Handles all digital twin-related API calls
 */

import httpClient from './httpClient';

/**
 * Get current digital twin state
 * @returns {Promise<Object>} Twin state with energy, mood, alignment, aura, etc.
 */
export async function getTwinState() {
  try {
    const response = await httpClient.get('/app/twin/state');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to get twin state:', error);
    throw error;
  }
}

export default {
  getTwinState,
};

