/**
 * Admin Modules Registry
 * 
 * This is the SINGLE SOURCE OF TRUTH for all admin modules.
 * To add a new module, simply add it here - routing and sidebar will update automatically.
 * 
 * Structure:
 * - id: Unique identifier (used in routes and component mapping)
 * - label: Display name in sidebar
 * - icon: Bootstrap icon class
 * - path: Route path (relative to /admin)
 * - permission: Required permission code (null = no permission required)
 * - order: Display order in sidebar (lower = higher)
 * - category: Optional grouping (for future nested menus)
 * 
 * Components are mapped in adminRoutes.js - add new components there when creating new modules.
 */

/**
 * Admin Modules Configuration
 * Add new modules here - they will automatically appear in sidebar and routing
 */
export const adminModules = [
  // Dashboard - always first, no permission required (always visible)
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'bi-speedometer2',
    path: 'dashboard',
    permission: null, // No permission required - all admins can access dashboard
    order: 1,
    category: null,
  },
  
  // User Management
  {
    id: 'users',
    label: 'Users',
    icon: 'bi-people',
    path: 'users',
    permission: 'MANAGE_USERS',
    order: 10,
    category: null,
  },
  
  // Admin User Management (RBAC)
  {
    id: 'admin-users',
    label: 'Admin Users',
    icon: 'bi-person-badge',
    path: 'admin-users',
    permission: 'MANAGE_ADMINS',
    order: 11,
    category: null,
  },
  
  // Roles & Permissions (RBAC)
  {
    id: 'role-list',
    label: 'Roles & Permissions',
    icon: 'bi-shield-check',
    path: 'role-list',
    permission: 'MANAGE_ROLES',
    order: 20,
    category: null,
  },
  
  // Communication Management - Templates
  {
    id: 'sms-templates',
    label: 'SMS Templates',
    icon: 'bi-chat-dots',
    path: 'sms-templates',
    permission: 'MANAGE_TEMPLATES',
    order: 30,
    category: 'communication',
  },
  {
    id: 'email-templates',
    label: 'Email Templates',
    icon: 'bi-envelope',
    path: 'email-templates',
    permission: 'MANAGE_TEMPLATES',
    order: 31,
    category: 'communication',
  },
  
  // Content & CMS
  {
    id: 'content',
    label: 'CMS Content',
    icon: 'bi-file-earmark-text',
    path: 'content',
    permission: 'MANAGE_CONTENT',
    order: 40,
    category: 'content',
  },
  
  // Master Data
  {
    id: 'master-entry',
    label: 'Master Entry',
    icon: 'bi-database',
    path: 'master-entry',
    permission: 'MANAGE_MASTER_DATA',
    order: 50,
    category: 'data',
  },
  
  // Products & Offerings
  // Uncomment when page is created:
  // {
  //   id: 'products',
  //   label: 'Products / Offerings',
  //   icon: 'bi-box-seam',
  //   path: 'products',
  //   permission: 'MANAGE_PRODUCTS',
  //   order: 60,
  //   category: 'products',
  // },
  
  // Subscription Management
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: 'bi-credit-card',
    path: 'subscriptions',
    permission: 'MANAGE_USERS', // Use MANAGE_USERS permission for now (can be changed to MANAGE_SUBSCRIPTIONS if added)
    order: 70,
    category: 'products',
  },
  
  // Analytics & Reports
  {
    id: 'karma',
    label: 'Karma Overview',
    icon: 'bi-graph-up',
    path: 'karma',
    permission: 'VIEW_KARMA',
    order: 80,
    category: 'analytics',
  },
  
  // Settings & Configuration
  {
    id: 'settings',
    label: 'Configuration',
    icon: 'bi-gear',
    path: 'settings',
    permission: 'VIEW_SETTINGS',
    order: 90,
    category: 'system',
  },
  
  // Profile - always last, no permission required
  {
    id: 'profile',
    label: 'Profile',
    icon: 'bi-person-circle',
    path: 'profile',
    permission: null, // No permission required - users can always access their profile
    order: 100,
    category: null,
  },
];

/**
 * Get modules sorted by order
 */
export const getSortedModules = () => {
  return [...adminModules].sort((a, b) => a.order - b.order);
};

/**
 * Get modules filtered by permission
 * @param {Function} hasPermission - Permission check function
 * @param {boolean} isSuperAdmin - Whether user is super admin
 */
export const getVisibleModules = (hasPermission, isSuperAdmin = false) => {
  return getSortedModules().filter(module => {
    // Super admin sees everything - no permission checks
    if (isSuperAdmin) return true;
    // If no permission required, always show
    if (!module.permission) return true;
    // Check permission for other admins
    return hasPermission(module.permission);
  });
};

/**
 * Get module by ID
 */
export const getModuleById = (id) => {
  return adminModules.find(module => module.id === id);
};

/**
 * Get module by path
 */
export const getModuleByPath = (path) => {
  return adminModules.find(module => module.path === path);
};
