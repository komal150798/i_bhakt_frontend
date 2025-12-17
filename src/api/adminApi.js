import httpClient from './httpClient';

const ADMIN_ENDPOINTS = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  CONTENT: '/admin/content',
  SETTINGS: '/admin/settings',
};

export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await httpClient.get(ADMIN_ENDPOINTS.DASHBOARD + '/stats');
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await httpClient.get(ADMIN_ENDPOINTS.USERS, { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await httpClient.get(`${ADMIN_ENDPOINTS.USERS}/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await httpClient.put(`${ADMIN_ENDPOINTS.USERS}/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await httpClient.delete(`${ADMIN_ENDPOINTS.USERS}/${userId}`);
    return response.data;
  },

  // Content
  getContent: async (params = {}) => {
    const response = await httpClient.get(ADMIN_ENDPOINTS.CONTENT, { params });
    return response.data;
  },

  createContent: async (contentData) => {
    const response = await httpClient.post(ADMIN_ENDPOINTS.CONTENT, contentData);
    return response.data;
  },

  updateContent: async (contentId, contentData) => {
    const response = await httpClient.put(`${ADMIN_ENDPOINTS.CONTENT}/${contentId}`, contentData);
    return response.data;
  },

  deleteContent: async (contentId) => {
    const response = await httpClient.delete(`${ADMIN_ENDPOINTS.CONTENT}/${contentId}`);
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await httpClient.get(ADMIN_ENDPOINTS.SETTINGS);
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await httpClient.put(ADMIN_ENDPOINTS.SETTINGS, settingsData);
    return response.data;
  },
};

