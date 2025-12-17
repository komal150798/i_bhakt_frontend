# Admin Permission System

## 🔐 Super Admin vs Regular Admin

### ✅ SUPER ADMIN - Full Access

**Role:** `super_admin`

**Access Rules:**
- ✅ **ALWAYS** has full access to ALL modules, routes, and actions
- ✅ **NO permission checks** are performed for super admins
- ✅ Even if backend doesn't send a `permissions` array, super admin still has full access
- ✅ All menu items in sidebar are visible
- ✅ All routes are accessible
- ✅ All actions are allowed

**Implementation:**
- `isSuperAdmin` is computed from `adminUser.role === 'super_admin'`
- `hasPermission()` always returns `true` for super admins
- `AdminRoute` bypasses permission checks for super admins
- `getVisibleModules()` shows all modules for super admins

### 🔒 OTHER ADMINS - Permission-Based

**Roles:** `admin`, `ops`, or any other role

**Access Rules:**
- ✅ Access is **restricted** based on `adminUser.permissions` array from backend
- ✅ Only modules/routes/actions they have permission for are accessible
- ✅ Menu items are filtered based on permissions
- ✅ Routes are protected by permission checks

**Implementation:**
- Permissions come from backend via `adminUser.permissions` array
- `hasPermission(permissionCode)` checks if permission exists in array
- `AdminRoute` enforces permission checks
- `getVisibleModules()` filters modules based on permissions

## 📋 Permission Flow

```
User Login
    ↓
Backend returns: { role, permissions: [...] }
    ↓
AdminAuthContext stores: { adminUser, isSuperAdmin, permissions }
    ↓
┌─────────────────────────────────────┐
│  Is Super Admin?                    │
└─────────────────────────────────────┘
    │                    │
   YES                   NO
    │                    │
    ↓                    ↓
Full Access      Check Permissions
(All modules)    (Filtered modules)
```

## 🔧 Key Functions

### `hasPermission(permissionCode)`
```js
// Super Admin: Always returns true
if (isSuperAdmin) return true;

// Other Admins: Check permissions array
return permissions.includes(permissionCode);
```

### `getVisibleModules(hasPermission, isSuperAdmin)`
```js
// Super Admin: Show all modules
if (isSuperAdmin) return true;

// Other Admins: Check permission
return hasPermission(module.permission);
```

### `AdminRoute` Component
```js
// Super Admin: Always allow
if (isSuperAdmin) return children;

// Other Admins: Check permission
if (permission && !hasPermission(permission)) {
  return <Navigate to="/admin/dashboard" />;
}
```

## 📝 Adding Permission Checks in Components

When adding permission checks in admin pages/components:

```jsx
import { useAdminAuth } from '../../common/context/AdminAuthContext';

function MyComponent() {
  const { hasPermission, isSuperAdmin } = useAdminAuth();
  
  // Super admin always has access
  if (isSuperAdmin || hasPermission('MANAGE_USERS')) {
    // Show action button
  }
}
```

**Best Practice:** Always check `isSuperAdmin` first, then `hasPermission()`.

## ⚠️ Important Notes

1. **Super Admin is Role-Based**: The check is `role === 'super_admin'`, not permission-based
2. **Backend Permissions**: Regular admins' permissions come from backend `permissions` array
3. **No Permissions Array**: If backend doesn't send permissions for super admin, it doesn't matter - super admin still has full access
4. **Consistent Checks**: All permission checks should use `hasPermission()` which already handles super admin
