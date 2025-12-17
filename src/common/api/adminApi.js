/**
 * Admin API Service
 * All admin API calls use admin_token from localStorage
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Get admin token from localStorage
 */
function getAdminToken() {
  return localStorage.getItem('admin_token');
}

/**
 * Make authenticated admin API request
 */
async function adminApiRequest(url, options = {}) {
  const token = getAdminToken();
  
  if (!token) {
    throw new Error('Admin token not found. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_info');
      window.location.href = '/admin/login';
      throw new Error('Session expired. Please login again.');
    }
    
    const error = await response.json().catch(() => ({ 
      message: `Request failed with status ${response.status}` 
    }));
    throw new Error(error.message || error.detail || 'Request failed');
  }

  const data = await response.json();
  // Handle wrapped response: { success, code, message, data }
  return data.data || data;
}

export const adminApi = {
  // Dashboard
  getDashboardSummary: async () => {
    return adminApiRequest('/admin/stats');
  },

  getDashboardCharts: async () => {
    return adminApiRequest('/admin/dashboard/charts');
  },

  // Users (cst_customer)
  getUsers: async (params = {}) => {
    return adminApiRequest('/admin/users/list', {
      method: 'POST',
      body: JSON.stringify({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || undefined,
        plan: params.plan || undefined,
        is_verified: params.is_verified !== undefined ? params.is_verified : undefined,
        is_active: params.is_active !== undefined ? params.is_active : undefined,
      }),
    });
  },

  getUserById: async (userId) => {
    return adminApiRequest(`/admin/users/${userId}`);
  },

  updateUser: async (userId, userData) => {
    return adminApiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (userId) => {
    return adminApiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications: async (limit = 10) => {
    return adminApiRequest(`/admin/notifications?limit=${limit}`);
  },

  markNotificationsRead: async (notificationIds = []) => {
    return adminApiRequest('/admin/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ notification_ids: notificationIds }),
    });
  },

  // Karma
  getKarmaOverview: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApiRequest(`/admin/karma-records${queryString ? `?${queryString}` : ''}`);
  },

  // Templates
  getSmsTemplates: async () => {
    const data = await adminApiRequest('/admin/messaging/sms-templates');
    return Array.isArray(data) ? data : data.data || [];
  },

  getSmsTemplateById: async (templateId) => {
    const data = await adminApiRequest(`/admin/messaging/sms-templates/${templateId}`);
    return data.data || data;
  },

  createSmsTemplate: async (templateData) => {
    const data = await adminApiRequest('/admin/messaging/sms-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return data.data || data;
  },

  updateSmsTemplate: async (templateId, templateData) => {
    const data = await adminApiRequest(`/admin/messaging/sms-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
    return data.data || data;
  },

  deleteSmsTemplate: async (templateId) => {
    return adminApiRequest(`/admin/messaging/sms-templates/${templateId}`, {
      method: 'DELETE',
    });
  },

  toggleSmsTemplateStatus: async (templateId, isActive) => {
    return adminApiRequest(`/admin/messaging/sms-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  getEmailTemplates: async () => {
    const data = await adminApiRequest('/admin/messaging/email-templates');
    return Array.isArray(data) ? data : data.data || [];
  },

  getEmailTemplateById: async (templateId) => {
    const data = await adminApiRequest(`/admin/messaging/email-templates/${templateId}`);
    return data.data || data;
  },

  createEmailTemplate: async (templateData) => {
    const data = await adminApiRequest('/admin/messaging/email-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return data.data || data;
  },

  updateEmailTemplate: async (templateId, templateData) => {
    const data = await adminApiRequest(`/admin/messaging/email-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
    return data.data || data;
  },

  deleteEmailTemplate: async (templateId) => {
    return adminApiRequest(`/admin/messaging/email-templates/${templateId}`, {
      method: 'DELETE',
    });
  },

  toggleEmailTemplateStatus: async (templateId, isActive) => {
    return adminApiRequest(`/admin/messaging/email-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  // Settings
  getSettings: async () => {
    return adminApiRequest('/admin/config');
  },

  updateSettings: async (settingsData) => {
    return adminApiRequest('/admin/config', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  // Subscriptions
  getSubscriptions: async (params = {}) => {
    return adminApiRequest('/admin/subscriptions/list', {
      method: 'POST',
      body: JSON.stringify({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || undefined,
        plan_type: params.plan_type || undefined,
        is_active: params.is_active !== undefined ? params.is_active : undefined,
        user_id: params.user_id || undefined,
      }),
    });
  },

  getSubscriptionById: async (id) => {
    return adminApiRequest(`/admin/subscriptions/${id}`);
  },

  createSubscription: async (subscriptionData) => {
    return adminApiRequest('/admin/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  },

  updateSubscription: async (id, subscriptionData) => {
    return adminApiRequest(`/admin/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    });
  },

  cancelSubscription: async (id, reason) => {
    return adminApiRequest(`/admin/subscriptions/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  },

  getAvailablePlans: async () => {
    return adminApiRequest('/admin/subscriptions/plans/available');
  },

  // Profile
  getAdminProfile: async () => {
    return adminApiRequest('/admin/auth/me');
  },

  updateAdminProfile: async (profileData) => {
    return adminApiRequest('/admin/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Admin Users (RBAC) - from adm_users table
  getAdminUsers: async (params = {}) => {
    return adminApiRequest('/admin/admins/list', {
      method: 'POST',
      body: JSON.stringify({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || undefined,
        role_id: params.role_id || undefined,
        is_enabled: params.is_enabled !== undefined ? params.is_enabled : undefined,
      }),
    });
  },

  getAdminUserById: async (userId) => {
    return adminApiRequest(`/admin/admins/${userId}`);
  },

  createAdminUser: async (userData) => {
    return adminApiRequest('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateAdminUser: async (userId, userData) => {
    return adminApiRequest(`/admin/admins/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  updateAdminUserRole: async (userId, roleId) => {
    return adminApiRequest(`/admin/admins/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role_id: roleId }),
    });
  },

  // Roles (RBAC)
  getRoles: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return adminApiRequest(`/admin/roles${queryString ? `?${queryString}` : ''}`);
  },

  getRoleById: async (roleId) => {
    return adminApiRequest(`/admin/roles/${roleId}`);
  },

  createRole: async (roleData) => {
    return adminApiRequest('/admin/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  updateRole: async (roleId, roleData) => {
    return adminApiRequest(`/admin/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  },

  deleteRole: async (roleId) => {
    return adminApiRequest(`/admin/roles/${roleId}`, {
      method: 'DELETE',
    });
  },

  getRolePermissions: async (roleId) => {
    return adminApiRequest(`/admin/roles/${roleId}/permissions`);
  },

  updateRolePermissions: async (roleId, permissions) => {
    return adminApiRequest(`/admin/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  },

  getPermissionsTree: async () => {
    return adminApiRequest('/admin/roles/permissions/tree');
  },
};

