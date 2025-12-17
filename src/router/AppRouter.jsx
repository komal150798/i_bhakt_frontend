import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// User Pages
import HomePage from '../pages/user/HomePage/HomePage';
import KundliPage from '../pages/user/KundliPage/KundliPage';
import HoroscopePage from '../pages/user/HoroscopePage/HoroscopePage';
import LoginPage from '../pages/user/LoginPage/LoginPage';
import SignupPage from '../pages/user/SignupPage/SignupPage';
import ReferPage from '../pages/user/ReferPage/ReferPage';

// Admin Pages
import DashboardPage from '../pages/admin/DashboardPage/DashboardPage';
import UsersPage from '../pages/admin/UsersPage/UsersPage';
import ContentPage from '../pages/admin/ContentPage/ContentPage';
import SettingsPage from '../pages/admin/SettingsPage/SettingsPage';

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

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="kundli" element={<KundliPage />} />
          <Route path="horoscope" element={<HoroscopePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="refer" element={<ReferPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

