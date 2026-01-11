import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import AOS from 'aos';

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  gender: string;
  otpCode: string;
};

const initialForm: FormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  timeOfBirth: '',
  placeOfBirth: '',
  latitude: null,
  longitude: null,
  timezone: 'Asia/Kolkata',
  gender: '',
  otpCode: '',
};

const LandingPage: React.FC = () => {
  const [mode, setMode] = useState<'initial' | 'register' | 'login'>('initial');
  const [form, setForm] = useState<FormState>(initialForm);
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setToken, setProfile, setUserId } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    AOS.refresh();
  }, [mode]);

  const handleSendOtp = async () => {
    if (!form.phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setSending(true);
    setError(null);
    setInfo(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: form.phoneNumber }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setInfo(`OTP sent! ${data.debug_code ? `Code: ${data.debug_code}` : ''}`);
      } else {
        setError(data.detail || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otpCode.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: form.phoneNumber,
          otp_code: form.otpCode,
          is_login: mode === 'login',
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Store token (using old format for compatibility)
        localStorage.setItem('ibhakt_token', data.token || data.access_token);
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        setToken(data.token || data.access_token);
        if (data.user_id) {
          setUserId(data.user_id);
          navigate('/dashboard');
        } else {
          // New user - continue registration
          setMode('register');
        }
      } else {
        setError(data.detail || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Handle location autocomplete
  const handleLocationChange = (value: string) => {
    setForm((prev) => ({ ...prev, placeOfBirth: value }));
    setError(null);
  };

  const handleLocationSelect = (locationData: {
    placeName: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }) => {
    setForm((prev) => ({
      ...prev,
      placeOfBirth: locationData.placeName,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timezone: locationData.timezone || 'Asia/Kolkata',
    }));
    setError(null);
  };

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '80px' }}>
      {/* Floating Background Elements */}
      <div className="position-fixed" style={{ top: '10%', left: '5%', zIndex: 0 }}>
        <i className="bi bi-circle-fill planet-icon" style={{ fontSize: '4rem', opacity: 0.1 }}></i>
      </div>
      <div className="position-fixed" style={{ top: '20%', right: '10%', zIndex: 0 }}>
        <i className="bi bi-circle-fill planet-icon" style={{ fontSize: '3rem', opacity: 0.1, animationDelay: '1s' }}></i>
      </div>
      <div className="position-fixed" style={{ bottom: '15%', left: '15%', zIndex: 0 }}>
        <i className="bi bi-circle-fill planet-icon" style={{ fontSize: '5rem', opacity: 0.1, animationDelay: '2s' }}></i>
      </div>

      {mode === 'initial' && (
        <section className="section-spacing position-relative" style={{ zIndex: 1 }}>
          <div className="container">
            <div className="row align-items-center min-vh-100">
              <div className="col-lg-6" data-aos="fade-right">
                <h1 className="display-1 mb-4">Unlock Your Cosmic Blueprint</h1>
                <p className="lead mb-4" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
                  Discover your destiny through <span className="text-gradient fw-bold">Kundli Generation</span> and 
                  harness the power of <span className="text-gradient fw-bold">Manifestation Resonance</span>
                </p>
                <p className="mb-5" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                  Join thousands who have transformed their lives by understanding their cosmic energies and aligning 
                  their manifestations with the universe.
                </p>
                <div className="d-flex flex-column flex-md-row gap-3">
                  <button
                    className="btn btn-cosmic btn-lg"
                    onClick={() => setMode('register')}
                    data-aos="fade-up"
                    data-aos-delay="100"
                  >
                    <i className="bi bi-stars me-2"></i>
                    Generate Kundli
                  </button>
                  <button
                    className="btn btn-cosmic-outline btn-lg"
                    onClick={() => setMode('login')}
                    data-aos="fade-up"
                    data-aos-delay="200"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </button>
                </div>
              </div>

              <div className="col-lg-6 text-center" data-aos="fade-left">
                <div className="cosmic-card-glass p-5">
                  <i className="bi bi-stars" style={{ fontSize: '8rem', background: 'var(--cosmic-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}></i>
                  <h3 className="mt-4 mb-3">Two Powerful Tools</h3>
                  <div className="row g-4 mt-3">
                    <div className="col-md-6">
                      <div className="cosmic-card h-100">
                        <i className="bi bi-compass" style={{ fontSize: '3rem', color: 'var(--cosmic-purple)', marginBottom: '1rem' }}></i>
                        <h5>Kundli Generation</h5>
                        <p className="text-muted">Discover your complete astrological profile</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="cosmic-card h-100">
                        <i className="bi bi-heart-pulse" style={{ fontSize: '3rem', color: 'var(--mystic-blue)', marginBottom: '1rem' }}></i>
                        <h5>Manifestation Engine</h5>
                        <p className="text-muted">Measure your resonance with the universe</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {(mode === 'register' || mode === 'login') && (
        <section className="section-spacing position-relative" style={{ zIndex: 1 }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 col-md-8">
                <div className="cosmic-card-glass p-5" data-aos="scale-in">
                  <div className="text-center mb-4">
                    <button
                      className="btn btn-link text-decoration-none"
                      onClick={() => {
                        setMode('initial');
                        setOtpSent(false);
                        setError(null);
                        setInfo(null);
                        setForm(initialForm);
                      }}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                    <h2 className="text-gradient mt-3">
                      {mode === 'login' ? 'Welcome Back' : 'Create Your Cosmic Profile'}
                    </h2>
                    <p className="text-muted">Enter your phone number to begin</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  {info && (
                    <div className="alert alert-info" role="alert">
                      <i className="bi bi-info-circle me-2"></i>
                      {info}
                    </div>
                  )}

                  {!otpSent ? (
                    <div>
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Phone Number</label>
                        <div className="input-group-cosmic">
                          <i className="bi bi-phone input-icon"></i>
                          <input
                            type="tel"
                            className="form-control cosmic-input"
                            placeholder="+1 234 567 8900"
                            value={form.phoneNumber}
                            onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        className="btn btn-cosmic w-100"
                        onClick={handleSendOtp}
                        disabled={sending}
                      >
                        {sending ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Send OTP
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Enter OTP Code</label>
                        <div className="input-group-cosmic">
                          <i className="bi bi-shield-check input-icon"></i>
                          <input
                            type="text"
                            className="form-control cosmic-input text-center"
                            placeholder="123456"
                            maxLength={6}
                            value={form.otpCode}
                            onChange={(e) => handleFormChange('otpCode', e.target.value.replace(/\D/g, ''))}
                          />
                        </div>
                        <small className="text-muted">
                          Didn't receive?{' '}
                          <button
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={handleSendOtp}
                            style={{ color: 'var(--cosmic-purple)' }}
                          >
                            Resend
                          </button>
                        </small>
                      </div>

                      {mode === 'register' && (
                        <>
                          <div className="mb-4">
                            <label className="form-label fw-semibold">Full Name</label>
                            <div className="input-group-cosmic">
                              <i className="bi bi-person input-icon"></i>
                              <input
                                type="text"
                                className="form-control cosmic-input"
                                placeholder="Enter your name"
                                value={form.fullName}
                                onChange={(e) => handleFormChange('fullName', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="form-label fw-semibold">Date of Birth</label>
                            <input
                              type="date"
                              className="form-control cosmic-input"
                              value={form.dateOfBirth}
                              onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                            />
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold">Time of Birth</label>
                              <input
                                type="time"
                                className="form-control cosmic-input"
                                value={form.timeOfBirth}
                                onChange={(e) => handleFormChange('timeOfBirth', e.target.value)}
                              />
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold">Gender</label>
                              <select
                                className="form-select cosmic-input"
                                value={form.gender}
                                onChange={(e) => handleFormChange('gender', e.target.value)}
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="form-label fw-semibold">Place of Birth</label>
                            <div className="input-group-cosmic">
                              <i className="bi bi-geo-alt input-icon"></i>
                              <LocationAutocomplete
                                value={form.placeOfBirth}
                                onChange={handleLocationChange}
                                onLocationSelect={handleLocationSelect}
                                placeholder="Search city, country..."
                                inputClassName="form-control cosmic-input"
                              />
                            </div>
                            {form.latitude && form.longitude && (
                              <small className="text-muted mt-1 d-block">
                                <i className="bi bi-geo-alt-fill me-1"></i>
                                {form.latitude.toFixed(4)}°, {form.longitude.toFixed(4)}°
                              </small>
                            )}
                          </div>
                        </>
                      )}

                      <button
                        className="btn btn-cosmic w-100"
                        onClick={handleVerifyOtp}
                        disabled={verifying}
                      >
                        {verifying ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Verify & Continue
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {mode === 'initial' && (
        <section className="section-spacing position-relative" style={{ zIndex: 1, background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="text-center mb-5" data-aos="fade-up">
              <h2 className="display-4 mb-3">Powerful Features</h2>
              <p className="lead text-muted">Everything you need for spiritual transformation</p>
            </div>

            <div className="row g-4">
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                <div className="cosmic-card h-100 text-center">
                  <div className="mb-3">
                    <i className="bi bi-stars" style={{ fontSize: '3rem', color: 'var(--cosmic-purple)' }}></i>
                  </div>
                  <h4>Complete Kundli</h4>
                  <p className="text-muted">Get detailed astrological chart with planets, houses, and dasha periods</p>
                </div>
              </div>

              <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                <div className="cosmic-card h-100 text-center">
                  <div className="mb-3">
                    <i className="bi bi-heart-pulse" style={{ fontSize: '3rem', color: 'var(--mystic-blue)' }}></i>
                  </div>
                  <h4>Manifestation Score</h4>
                  <p className="text-muted">Measure how aligned your desires are with cosmic energies</p>
                </div>
              </div>

              <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                <div className="cosmic-card h-100 text-center">
                  <div className="mb-3">
                    <i className="bi bi-graph-up-arrow" style={{ fontSize: '3rem', color: 'var(--soft-gold)' }}></i>
                  </div>
                  <h4>Karma Tracking</h4>
                  <p className="text-muted">Track your daily actions and their cosmic impact</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-5 position-relative" style={{ zIndex: 1, background: 'var(--bg-secondary)', borderTop: '1px solid var(--card-border)' }}>
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-4">
              <h5 className="text-gradient mb-3">iBhakt</h5>
              <p className="text-muted">Your cosmic companion for spiritual growth and manifestation.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-muted mb-0">&copy; {new Date().getFullYear()} iBhakt DT. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
