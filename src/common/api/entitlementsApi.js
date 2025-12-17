/**
 * Entitlements API functions
 * Handles plan entitlements and feature access checking
 */

import httpClient from './httpClient';

/**
 * Get all user entitlements based on current plan
 * @returns {Promise<Object>} User entitlements with plan info and features
 */
export async function getEntitlements() {
  try {
    const response = await httpClient.get('/app/entitlements');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to get entitlements:', error);
    throw error;
  }
}

/**
 * Check if user has access to a specific feature
 * @param {string} feature - Feature name (e.g., 'mfp_score', 'karma_circles')
 * @returns {Promise<Object>} Feature access check result
 */
export async function checkFeatureAccess(feature) {
  try {
    const response = await httpClient.get(`/app/entitlements/check/${feature}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Failed to check feature access for ${feature}:`, error);
    throw error;
  }
}

export default {
  getEntitlements,
  checkFeatureAccess,
};
