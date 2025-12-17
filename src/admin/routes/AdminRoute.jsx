import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../common/context/AdminAuthContext';

/**
 * AdminRoute - Permission-based route guard
 * 
 * SUPER ADMIN: Always allowed (full access, no permission checks)
 * OTHER ADMINS: Checked against their permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child component to render
 * @param {string} props.permission - Required permission code (optional)
 */
function AdminRoute({ children, permission }) {
  const { isAdmin, hasPermission, isLoading, isSuperAdmin } = useAdminAuth();

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if user is admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // SUPER ADMIN: Always allow access (full rights, no permission checks)
  if (isSuperAdmin) {
    return children;
  }

  // OTHER ADMINS: Check specific permission if required
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;

