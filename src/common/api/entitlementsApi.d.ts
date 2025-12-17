/**
 * Entitlements API functions
 * Handles plan entitlements and feature access checking
 */

export interface Entitlements {
  plan?: string;
  plan_type?: string;
  plan_name?: string;
  features?: Array<{ feature: string; allowed: boolean; limit?: number }> | Record<string, any>;
  usage_limits?: Record<string, { limit: number; current: number }>;
  [key: string]: any;
}

export interface FeatureAccess {
  hasAccess?: boolean;
  [key: string]: any;
}

/**
 * Get all user entitlements based on current plan
 * @returns Promise<Entitlements> User entitlements with plan info and features
 */
export function getEntitlements(): Promise<any>;

/**
 * Check if user has access to a specific feature
 * @param feature - Feature name (e.g., 'mfp_score', 'karma_circles')
 * @returns Promise<FeatureAccess> Feature access check result
 */
export function checkFeatureAccess(feature: string): Promise<FeatureAccess>;

declare const entitlementsApi: {
  getEntitlements: typeof getEntitlements;
  checkFeatureAccess: typeof checkFeatureAccess;
};

export default entitlementsApi;

