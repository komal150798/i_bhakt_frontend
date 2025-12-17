import React, { useState, useEffect } from 'react';
import AOS from 'aos';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    AOS.refresh();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="display-3 mb-4">Contact Us</h1>
              <p className="lead text-muted">
                We'd love to hear from you. Get in touch with our team.
              </p>
            </div>

            <div className="row g-4">
              {/* Contact Information */}
              <div className="col-lg-4" data-aos="fade-right">
                <div className="cosmic-card h-100">
                  <h3 className="text-gradient mb-4">Get In Touch</h3>
                  
                  <div className="mb-4">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '50px', height: '50px', background: 'var(--bg-secondary)' }}>
                          <i className="bi bi-envelope-fill" style={{ fontSize: '1.5rem', color: 'var(--cosmic-purple)' }}></i>
                        </div>
                      </div>
                      <div>
                        <h5 className="mb-1">Email</h5>
                        <a href="mailto:support@ibhakt.com" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                          support@ibhakt.com
                        </a>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '50px', height: '50px', background: 'var(--bg-secondary)' }}>
                          <i className="bi bi-telephone-fill" style={{ fontSize: '1.5rem', color: 'var(--mystic-blue)' }}></i>
                        </div>
                      </div>
                      <div>
                        <h5 className="mb-1">Phone</h5>
                        <a href="tel:+911234567890" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                          +91 123 456 7890
                        </a>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '50px', height: '50px', background: 'var(--bg-secondary)' }}>
                          <i className="bi bi-geo-alt-fill" style={{ fontSize: '1.5rem', color: 'var(--soft-gold)' }}></i>
                        </div>
                      </div>
                      <div>
                        <h5 className="mb-1">Address</h5>
                        <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                          123 Spiritual Street,<br />
                          Mumbai, Maharashtra 400001<br />
                          India
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr style={{ borderColor: 'var(--card-border)' }} />

                  <div>
                    <h5 className="mb-3">Follow Us</h5>
                    <div className="d-flex gap-3">
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                         className="btn btn-outline-light rounded-circle"
                         style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--input-border)' }}>
                        <i className="bi bi-instagram"></i>
                      </a>
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                         className="btn btn-outline-light rounded-circle"
                         style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--input-border)' }}>
                        <i className="bi bi-youtube"></i>
                      </a>
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                         className="btn btn-outline-light rounded-circle"
                         style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--input-border)' }}>
                        <i className="bi bi-facebook"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="col-lg-8" data-aos="fade-left">
                <div className="cosmic-card">
                  <h3 className="text-gradient mb-4">Send us a Message</h3>

                  {submitted && (
                    <div className="alert alert-success" role="alert">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Thank you! Your message has been sent. We'll get back to you soon.
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Name *</label>
                        <input
                          type="text"
                          className="form-control cosmic-input"
                          required
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email *</label>
                        <input
                          type="email"
                          className="form-control cosmic-input"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Phone</label>
                        <input
                          type="tel"
                          className="form-control cosmic-input"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Subject *</label>
                        <input
                          type="text"
                          className="form-control cosmic-input"
                          required
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Message *</label>
                        <textarea
                          className="form-control cosmic-input"
                          rows={6}
                          required
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-cosmic"
                          disabled={submitting}
                        >
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







