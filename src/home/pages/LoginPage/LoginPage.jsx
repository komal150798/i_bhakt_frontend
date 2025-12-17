import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import { useToast } from '../../../common/hooks/useToast';
import { handleApiError } from '../../../common/utils/apiErrorHandler';
import * as authApi from '../../../common/api/authApi';
import Loader from '../../../common/components/Loader/Loader';
import styles from './LoginPage.module.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithTokens } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState('password');

  // Password login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [otpStatus, setOtpStatus] = useState(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);

  // Google login state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);

  // Handle password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use the login function from AuthContext which handles token storage
      await login({ email: username, password });
      showSuccess('Login successful', {
        description: 'Welcome back to I-Bhakt!',
      });
      navigate('/');
    } catch (err) {
      const errorMessage = handleApiError(err, { defaultMessage: 'Login failed. Please check your credentials.' });
      setError(errorMessage);
      showError('Login failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP send
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpError(null);
    setOtpStatus(null);
    setIsOtpLoading(true);

    try {
      const result = await authApi.sendOtp(phoneNumber);
      setOtpSent(true);
      const statusMessage = result.debug_code
        ? `OTP sent! Debug code: ${result.debug_code}`
        : `OTP sent to ${phoneNumber}`;
      setOtpStatus(statusMessage);
      showSuccess('OTP sent', {
        description: statusMessage,
      });
    } catch (err) {
      const errorMessage = handleApiError(err, { defaultMessage: 'Failed to send OTP. Please try again.' });
      setOtpError(errorMessage);
      showError('Failed to send OTP', {
        description: errorMessage,
      });
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Handle OTP verify
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError(null);
    setIsVerifyLoading(true);

    try {
      const result = await authApi.verifyOtp({
        phone_number: phoneNumber,
        otp_code: otpCode,
      });
      // Use loginWithTokens to store in localStorage and update state
      loginWithTokens(result.access_token, result.refresh_token, result.user);
      navigate('/');
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsVerifyLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);

    try {
      // TODO: Integrate Google Sign-In SDK
      // For now, this is a placeholder
      // In production, use: https://developers.google.com/identity/gsi/web
      const idToken = await getGoogleIdToken(); // Placeholder function
      
      if (!idToken) {
        throw new Error('Google Sign-In not available. Please use another login method.');
      }

      const result = await authApi.loginWithGoogle(idToken);
      loginWithTokens(result.access_token, result.refresh_token, result.user);
      navigate('/');
    } catch (err) {
      setGoogleError(err.message || 'Google login failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Placeholder for Google ID token (to be replaced with actual Google Sign-In SDK)
  const getGoogleIdToken = async () => {
    // TODO: Implement Google Sign-In SDK integration
    // Example:
    // const { GoogleAuth } = await import('google-auth-library');
    // or use Google Identity Services: https://developers.google.com/identity/gsi/web
    return null;
  };

  // Reset OTP form when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setOtpSent(false);
    setOtpCode('');
    setOtpError(null);
    setOtpStatus(null);
    setError(null);
    setGoogleError(null);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome to I-Bhakt</h1>
          <p className={styles.subtitle}>Choose how you want to login</p>

          {/* Tab Switcher */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'password' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('password')}
            >
              Username / Password
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'otp' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('otp')}
            >
              OTP Login
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'google' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('google')}
            >
              Google
            </button>
          </div>

          {/* Password Login Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className={styles.forgotPassword}>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isLoading}
              >
                {isLoading ? <Loader size="sm" /> : 'Login'}
              </button>
              <p className={styles.signupLink}>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </form>
          )}

          {/* OTP Login Form */}
          {activeTab === 'otp' && (
            <div className={styles.form}>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div className={styles.inputGroup}>
                    <input
                      type="tel"
                      className={styles.input}
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      autoComplete="tel"
                    />
                  </div>
                  {otpError && <div className={styles.error}>{otpError}</div>}
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isOtpLoading}
                  >
                    {isOtpLoading ? <Loader size="sm" /> : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  {otpStatus && (
                    <div className={styles.success}>{otpStatus}</div>
                  )}
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Enter OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      maxLength={6}
                      pattern="[0-9]{4,6}"
                    />
                  </div>
                  <div className={styles.otpActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setOtpError(null);
                        setOtpStatus(null);
                      }}
                    >
                      Change Number
                    </button>
                  </div>
                  {otpError && <div className={styles.error}>{otpError}</div>}
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isVerifyLoading || !otpCode}
                  >
                    {isVerifyLoading ? <Loader size="sm" /> : 'Verify & Login'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Google Login */}
          {activeTab === 'google' && (
            <div className={styles.form}>
              <button
                type="button"
                className={styles.googleButton}
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <svg
                      className={styles.googleIcon}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              <p className={styles.googleSubtext}>
                We will never post anything without your permission.
              </p>
              {googleError && <div className={styles.error}>{googleError}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
