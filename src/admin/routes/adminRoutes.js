/**
 * Dynamic Admin Routes Generator
 * 
 * This file automatically generates routes from the adminModules registry.
 * No need to manually add routes - just add modules to adminModules.js
 */

import { adminModules } from '../config/adminModules';

// Direct imports for routes (can be lazy-loaded later if needed for code splitting)
import AdminDashboardPage from '../pages/Dashboard/AdminDashboardPage';
import AdminUsersPage from '../pages/Users/AdminUsersPage';
import AdminRolesPage from '../pages/Roles/AdminRolesPage';
import AdminKarmaOverviewPage from '../pages/Karma/AdminKarmaOverviewPage';
import AdminTemplatesPage from '../pages/Templates/AdminTemplatesPage';
import SmsTemplatesPage from '../pages/Templates/SmsTemplatesPage';
import EmailTemplatesPage from '../pages/Templates/EmailTemplatesPage';
import AdminSettingsPage from '../pages/Settings/AdminSettingsPage';
import AdminProfilePage from '../pages/Profile/AdminProfilePage';
import AdminMasterEntryPage from '../pages/MasterEntry/AdminMasterEntryPage';
import ContentPage from '../pages/Content/ContentPage';
import AdminUserListPage from '../pages/UserManagement/AdminUserListPage';
import RoleListPage from '../pages/UserManagement/RoleListPage';
import AdminSubscriptionsPage from '../pages/Subscriptions/AdminSubscriptionsPage';
import AIPromptsPage from '../pages/Prompts/AIPromptsPage';

// Component mapping for routes
const componentMap = {
  'dashboard': AdminDashboardPage,
  'users': AdminUsersPage,
  'roles': AdminRolesPage,
  'karma': AdminKarmaOverviewPage,
  'templates': AdminTemplatesPage,
  'sms-templates': SmsTemplatesPage,
  'email-templates': EmailTemplatesPage,
  'settings': AdminSettingsPage,
  'profile': AdminProfilePage,
  'master-entry': AdminMasterEntryPage,
  'content': ContentPage,
  'admin-users': AdminUserListPage,
  'role-list': RoleListPage,
  'subscriptions': AdminSubscriptionsPage,
  'ai-prompts': AIPromptsPage,
  // Add future modules here:
  // 'sms-management': AdminSmsManagementPage,
  // 'email-management': AdminEmailManagementPage,
  // 'products': AdminProductsPage,
  // 'subscription-plans': AdminSubscriptionPlansPage,
};

/**
 * Generate routes from admin modules
 * This automatically creates routes for all modules in the registry
 */
export const generateAdminRoutes = () => {
  return adminModules
    .filter(module => componentMap[module.id]) // Only include modules with components
    .map(module => ({
      id: module.id,
      path: module.path,
      element: componentMap[module.id],
      permission: module.permission,
    }));
};

/**
 * Get route configuration for React Router
 * Includes index route for dashboard
 */
export const adminRoutes = [
  // Index route - redirects to dashboard
  {
    path: '',
    element: AdminDashboardPage,
    index: true,
    permission: 'VIEW_DASHBOARD',
  },
  // All other routes from modules
  ...generateAdminRoutes(),
];

/**
 * Get menu items for sidebar
 * Automatically generated from adminModules
 */
export const adminMenuItems = adminModules
  .filter(module => componentMap[module.id]) // Only show modules with components
  .map(module => ({
    id: module.id,
    path: `/admin/${module.path}`,
    label: module.label,
    icon: module.icon,
    permission: module.permission,
    order: module.order,
    category: module.category,
  }));
