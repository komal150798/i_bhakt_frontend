import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../common/hooks/useAuth';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import { useToast } from '../../../common/hooks/useToast';
import { handleApiError } from '../../../common/utils/apiErrorHandler';
import * as authApi from '../../../common/api/authApi';
import Loader from '../../../common/components/Loader/Loader';
import styles from './LoginPage.module.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
      // Redirect to the page user was trying to access, or home page
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
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
      // Redirect to the page user was trying to access, or home page
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsVerifyLoading(false);
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleError(null);
    setIsGoogleLoading(true);

    try {
      // The 'credential' IS the ID Token your backend needs
      const idToken = credentialResponse.credential;
      
      if (!idToken) {
        throw new Error('Google Sign-In not available.');
      }

      console.log('Sending Token to Backend:', idToken);

      // Call your backend API
      const result = await authApi.loginWithGoogle(idToken);
      
      // Login the user
      loginWithTokens(result.access_token, result.refresh_token, result.user);
      
      showSuccess('Login successful', {
        description: 'Welcome back to I-Bhakt!',
      });
      
      // Redirect to the page user was trying to access, or home page
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google Login Failed:', err);
      const errorMessage = handleApiError(err, { defaultMessage: 'Google login failed. Please try again.' });
      setGoogleError(errorMessage);
      showError('Google login failed', {
        description: errorMessage,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    setGoogleError('Google Sign-In was unsuccessful. Please try again.');
    showError('Google Sign-In failed', {
      description: 'Google Sign-In was unsuccessful. Please try again.',
    });
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
                Don't have an account?{' '}
                <Link to="/signup" state={{ from: location.state?.from }}>Sign up</Link>
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
              <div style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="rectangular"
                  text="signin_with"
                  size="large"
                />
              </div>
              {isGoogleLoading && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <Loader size="sm" />
                  <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                    Verifying with Server...
                  </p>
                </div>
              )}
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
