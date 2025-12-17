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
  return (
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
  );
}

export default App;

