import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HomeLayout from '../../home/layout/HomeLayout';
import AdminLayout from '../../admin/layout/AdminLayout';
import { homeRoutes } from '../../home/routes/homeRoutes';
import { adminRoutes } from '../../admin/routes/adminRoutes.js';
import AdminRoute from '../../admin/routes/AdminRoute';
import AdminLoginPage from '../../pages/AdminLoginPage';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminProtectedRoute({ children }) {
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Login - must come before protected admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Home Routes */}
        <Route path="/" element={<HomeLayout />}>
          {homeRoutes.map((route) => {
            // For nested routes, use relative paths (remove leading slash)
            // If path is '/', use index route instead
            if (route.path === '/' && route.index) {
              return (
                <Route
                  key={route.path}
                  index
                  element={<route.element />}
                />
              );
            }
            // Remove leading slash for nested routes
            const relativePath = route.path.replace(/^\//, '');
            return (
              <Route
                key={route.path}
                path={relativePath}
                element={<route.element />}
              />
            );
          })}
        </Route>

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          {adminRoutes.map((route) => {
            // For index routes
            if (route.index) {
              return (
                <Route
                  key="index"
                  index
                  element={
                    route.permission ? (
                      <AdminRoute permission={route.permission}>
                        <route.element />
                      </AdminRoute>
                    ) : (
                      <route.element />
                    )
                  }
                />
              );
            }
            // For regular routes
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.permission ? (
                    <AdminRoute permission={route.permission}>
                      <route.element />
                    </AdminRoute>
                  ) : (
                    <route.element />
                  )
                }
              />
            );
          })}
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
