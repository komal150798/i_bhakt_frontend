import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './common/context/AuthContext';
import { AdminAuthProvider } from './common/context/AdminAuthContext';
import { LanguageProvider } from './common/i18n/LanguageContext';
import { ToastProvider } from './common/components/Toast/ToastProvider';
import AppRouter from './common/routes/AppRouter';
import './styles/variables.css';
import './styles/globals.css';
import './styles/bootstrap-overrides.css';

function App() {
  // Get Google Client ID from environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <AdminAuthProvider>
                <AppRouter />
              </AdminAuthProvider>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

