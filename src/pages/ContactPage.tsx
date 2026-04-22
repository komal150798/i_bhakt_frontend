import React, { useState, useEffect } from 'react';
import { refreshAos } from '../common/utils/refreshAos';
import styles from './ContactPage.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type FieldKey = keyof FormData;

const initialForm: FormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function stripPhone(value: string): string {
  return value.replace(/[\s().-]/g, '');
}

/** Optional field: empty is OK; otherwise Indian mobile (10 digits, 6–9 start) or +91 prefix. */
function isValidOptionalIndiaPhone(value: string): boolean {
  const raw = value.trim();
  if (!raw) return true;
  let d = stripPhone(raw);
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('91') && d.length === 12) d = d.slice(2);
  if (d.length !== 10) return false;
  return /^[6-9]\d{9}$/.test(d);
}

function validateContact(data: FormData): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  const name = data.name.trim();
  const email = data.email.trim();
  const subject = data.subject.trim();
  const message = data.message.trim();

  if (!name) {
    errors.name = 'Please enter your name.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (name.length > 120) {
    errors.name = 'Name is too long (max 120 characters).';
  }

  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address (e.g. name@example.com).';
  }

  if (!isValidOptionalIndiaPhone(data.phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number, or leave blank. You may start with +91.';
  }

  if (!subject) {
    errors.subject = 'Please enter a subject.';
  } else if (subject.length < 3) {
    errors.subject = 'Subject must be at least 3 characters.';
  } else if (subject.length > 200) {
    errors.subject = 'Subject is too long (max 200 characters).';
  }

  if (!message) {
    errors.message = 'Please enter your message.';
  } else if (message.length < 15) {
    errors.message = 'Message must be at least 15 characters so we can help you properly.';
  } else if (message.length > 5000) {
    errors.message = 'Message is too long (max 5000 characters).';
  }

  return errors;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ ...initialForm });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshAos();
  }, []);

  const handleChange = (field: FieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateContact(formData);
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) {
      const first = Object.keys(validation)[0] as FieldKey;
      const el = document.getElementById(`contact-${first}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      const response = await fetch(`${API_URL}/home/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ ...initialForm });
      setFieldErrors({});
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const invalid = (key: FieldKey) => Boolean(fieldErrors[key]);

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="page-hero-heading fw-bold mb-4">Contact Us</h1>
              <p className="lead page-hero-subtitle">
                We&apos;d love to hear from you. Get in touch with our team.
              </p>
            </div>

            <div className="row g-4">
              {/* Contact Information */}
              <div className="col-lg-4" data-aos="fade-right">
                <div className="cosmic-card h-100">
                  <h3 className="page-hero-heading page-hero-heading--compact fw-bold mb-2">Get In Touch</h3>
                  <p className={styles.cardLead}>
                    Email, phone, or post — we read every message and reply as soon as we can.
                  </p>

                  <div className="mb-4">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '50px', height: '50px', background: 'var(--bg-secondary)' }}
                        >
                          <i className="bi bi-envelope-fill" style={{ fontSize: '1.5rem', color: 'var(--cosmic-purple)' }}></i>
                        </div>
                      </div>
                      <div>
                        <h5 className={`mb-1 ${styles.fieldTitle}`}>Email</h5>
                        <a href="mailto:support@ibhakt.com" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                          support@ibhakt.com
                        </a>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '50px', height: '50px', background: 'var(--bg-secondary)' }}
                        >
                          <i className="bi bi-telephone-fill" style={{ fontSize: '1.5rem', color: 'var(--mystic-blue)' }}></i>
                        </div>
                      </div>
                      <div>
                        <h5 className={`mb-1 ${styles.fieldTitle}`}>Phone</h5>
                        <a href="tel:+919767149042" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                          +91 9767149042
                        </a>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '50px', height: '50px', background: 'var(--bg-secondary)' }}
                        >
                          <i className="bi bi-geo-alt-fill" style={{ fontSize: '1.5rem', color: 'var(--soft-gold)' }}></i>
                        </div>
                      </div>
                      <div>
                        <h5 className={`mb-1 ${styles.fieldTitle}`}>Address</h5>
                        <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                          Jagruti Colony,
                          <br />
                          Narendra nagar, Nagpur, Maharashtra 440015
                          <br />
                          India
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr style={{ borderColor: 'var(--card-border)' }} />

                  <div>
                    <h5 className={`mb-3 ${styles.fieldTitle}`}>Follow Us</h5>
                    <div className="d-flex gap-3">
                      <a
                        href="https://www.instagram.com/ibhakt.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-light rounded-circle"
                        style={{
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: 'var(--input-border)',
                        }}
                      >
                        <i className="bi bi-instagram"></i>
                      </a>
                      <a
                        href="https://youtube.com/@ibhakt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-light rounded-circle"
                        style={{
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: 'var(--input-border)',
                        }}
                      >
                        <i className="bi bi-youtube"></i>
                      </a>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-light rounded-circle"
                        style={{
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: 'var(--input-border)',
                        }}
                      >
                        <i className="bi bi-facebook"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="col-lg-8" data-aos="fade-left">
                <div className="cosmic-card">
                  <h3 className="page-hero-heading page-hero-heading--compact fw-bold mb-2">Send us a Message</h3>
                  <p className={styles.cardLead}>
                    Share a few details below. We typically respond within 24–48 hours on business days.
                  </p>

                  {submitted && (
                    <div className={styles.alertSuccess} role="alert">
                      <i className="bi bi-check-circle-fill me-2" style={{ color: 'var(--success-color, #34a37e)' }}></i>
                      Thank you! Your message has been sent. We&apos;ll get back to you soon.
                    </div>
                  )}

                  {error && (
                    <div className={styles.alertDanger} role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: 'var(--danger-color, #e07070)' }}></i>
                      {error}
                    </div>
                  )}

                  <form noValidate onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="contact-name" className={`form-label ${styles.formLabel}`}>
                          Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          autoComplete="name"
                          aria-invalid={invalid('name')}
                          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                          className={`form-control cosmic-input ${invalid('name') ? styles.inputInvalid : ''}`}
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                        {fieldErrors.name && (
                          <span id="contact-name-error" className={styles.fieldError} role="alert">
                            {fieldErrors.name}
                          </span>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="contact-email" className={`form-label ${styles.formLabel}`}>
                          Email *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          aria-invalid={invalid('email')}
                          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                          className={`form-control cosmic-input ${invalid('email') ? styles.inputInvalid : ''}`}
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                        {fieldErrors.email && (
                          <span id="contact-email-error" className={styles.fieldError} role="alert">
                            {fieldErrors.email}
                          </span>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="contact-phone" className={`form-label ${styles.formLabel}`}>
                          Phone <span className="fw-normal opacity-75">(optional)</span>
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="e.g. 9876543210 or +91 9876543210"
                          aria-invalid={invalid('phone')}
                          aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
                          className={`form-control cosmic-input ${invalid('phone') ? styles.inputInvalid : ''}`}
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                        {fieldErrors.phone && (
                          <span id="contact-phone-error" className={styles.fieldError} role="alert">
                            {fieldErrors.phone}
                          </span>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="contact-subject" className={`form-label ${styles.formLabel}`}>
                          Subject *
                        </label>
                        <input
                          id="contact-subject"
                          type="text"
                          autoComplete="off"
                          aria-invalid={invalid('subject')}
                          aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
                          className={`form-control cosmic-input ${invalid('subject') ? styles.inputInvalid : ''}`}
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                        />
                        {fieldErrors.subject && (
                          <span id="contact-subject-error" className={styles.fieldError} role="alert">
                            {fieldErrors.subject}
                          </span>
                        )}
                      </div>
                      <div className="col-12">
                        <label htmlFor="contact-message" className={`form-label ${styles.formLabel}`}>
                          Message *
                        </label>
                        <textarea
                          id="contact-message"
                          className={`form-control cosmic-input ${invalid('message') ? styles.inputInvalid : ''}`}
                          rows={6}
                          autoComplete="off"
                          aria-invalid={invalid('message')}
                          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                        ></textarea>
                        {fieldErrors.message && (
                          <span id="contact-message-error" className={styles.fieldError} role="alert">
                            {fieldErrors.message}
                          </span>
                        )}
                      </div>
                      <div className="col-12">
                        <button type="submit" className="btn btn-cosmic" disabled={submitting}>
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send me-2"></i>
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
