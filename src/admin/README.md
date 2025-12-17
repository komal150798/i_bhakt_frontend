# Admin Panel Architecture

## 📁 Folder Structure

```
src/admin/
├── config/
│   └── adminModules.js          # SINGLE SOURCE OF TRUTH - Module registry
├── routes/
│   ├── adminRoutes.js           # Dynamic route generator
│   └── AdminRoute.jsx           # Permission-based route guard
├── layout/
│   ├── AdminLayout.jsx          # Main admin layout
│   ├── AdminSidebar.jsx         # Dynamic sidebar (auto-generates from modules)
│   └── AdminHeader.jsx          # Admin header
├── pages/
│   ├── Dashboard/               # Dashboard module
│   ├── Users/                   # User management
│   ├── Roles/                   # Roles & permissions
│   ├── Templates/               # Email/SMS templates
│   ├── Content/                 # CMS content
│   ├── MasterEntry/             # Master data
│   ├── Settings/                # Configuration
│   └── Profile/                 # User profile
└── components/                  # Reusable admin components
```

## 🚀 How to Add a New Module

### Step 1: Create the Page Component

Create your page in `src/admin/pages/YourModule/YourModulePage.jsx`:

```jsx
function YourModulePage() {
  return <div>Your Module Content</div>;
}
export default YourModulePage;
```

### Step 2: Add Component to Routes

In `src/admin/routes/adminRoutes.js`, add to `componentMap`:

```js
const componentMap = {
  // ... existing modules
  'your-module-id': YourModulePage,
};
```

### Step 3: Register Module

In `src/admin/config/adminModules.js`, add your module:

```js
{
  id: 'your-module-id',
  label: 'Your Module Name',
  icon: 'bi-icon-name',
  path: 'your-module-path',
  permission: 'YOUR_PERMISSION_CODE', // or null for no permission
  order: 25, // Display order (lower = higher in sidebar)
  category: 'optional-category', // Optional grouping
},
```

**That's it!** The module will automatically:
- ✅ Appear in the sidebar
- ✅ Have routing configured
- ✅ Respect permissions
- ✅ Be sorted by order

## 🔐 Permissions

- Permissions come from backend via `adminUser.permissions` array
- Super admins have all permissions automatically
- Modules with `permission: null` are always visible
- Permission checking is handled by `AdminRoute` component

## 📱 Features

- **Dynamic Sidebar**: Auto-generates from module registry
- **Permission-Based**: Only shows modules user has access to
- **Theme Support**: Dark/light theme compatible
- **Responsive**: Mobile-friendly with collapsible sidebar
- **Scalable**: Easy to add new modules without touching routing/sidebar code

## 🎯 Module Configuration

Each module in `adminModules.js` has:

- `id`: Unique identifier (used for component mapping)
- `label`: Display name in sidebar
- `icon`: Bootstrap icon class (e.g., 'bi-speedometer2')
- `path`: URL path (relative to /admin)
- `permission`: Required permission code (null = no permission)
- `order`: Display order (1-100, lower = higher)
- `category`: Optional grouping for future nested menus

## 🔄 Future Modules (Ready to Uncomment)

The following modules are pre-configured but commented out. Just uncomment and create the pages:

- SMS Management
- Email Management  
- Products / Offerings
- Subscription Plans
