import React, { useEffect } from 'react';
import AOS from 'aos';

const AboutPage: React.FC = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Hero Section */}
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="display-3 mb-4">About iBhakt</h1>
              <p className="lead text-muted">
                Your cosmic companion for spiritual growth and manifestation
              </p>
            </div>

            {/* Mission Section */}
            <section className="cosmic-card mb-5" data-aos="fade-up" data-aos-delay="100">
              <h2 className="text-gradient mb-4">Our Mission</h2>
              <p className="mb-3" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                At iBhakt, we believe that everyone has a unique cosmic blueprint that guides their journey through life. 
                Our mission is to make ancient Vedic wisdom accessible to everyone, helping you understand your karma, 
                align with cosmic energies, and manifest your deepest desires.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                We combine traditional astrology with modern technology to provide personalized insights that empower 
                you to make informed decisions and live a life of purpose and fulfillment.
              </p>
            </section>

            {/* Features Section */}
            <section className="mb-5" data-aos="fade-up" data-aos-delay="200">
              <h2 className="text-gradient mb-4 text-center">What We Offer</h2>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="cosmic-card h-100">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <i className="bi bi-stars" style={{ fontSize: '2.5rem', color: 'var(--cosmic-purple)' }}></i>
                      </div>
                      <div>
                        <h4 className="mb-2">Kundli Generation</h4>
                        <p className="text-muted mb-0">
                          Generate your complete astrological birth chart with detailed planetary positions, 
                          houses, and dasha periods based on Vedic astrology principles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="cosmic-card h-100">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <i className="bi bi-heart-pulse" style={{ fontSize: '2.5rem', color: 'var(--mystic-blue)' }}></i>
                      </div>
                      <div>
                        <h4 className="mb-2">Manifestation Resonance</h4>
                        <p className="text-muted mb-0">
                          Measure how aligned your desires are with cosmic energies. Get personalized insights 
                          to enhance your manifestation journey and achieve your goals faster.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="cosmic-card h-100">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <i className="bi bi-graph-up-arrow" style={{ fontSize: '2.5rem', color: 'var(--soft-gold)' }}></i>
                      </div>
                      <div>
                        <h4 className="mb-2">Karma Tracking</h4>
                        <p className="text-muted mb-0">
                          Track your daily actions and understand their karmic impact. Build positive karma 
                          through conscious living and spiritual practices.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="cosmic-card h-100">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <i className="bi bi-compass" style={{ fontSize: '2.5rem', color: 'var(--astro-violet)' }}></i>
                      </div>
                      <div>
                        <h4 className="mb-2">Cosmic Guidance</h4>
                        <p className="text-muted mb-0">
                          Receive daily personalized guidance based on your astrological chart and current 
                          planetary transits to navigate life's challenges with wisdom.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Values Section */}
            <section className="cosmic-card-glass mb-5" data-aos="fade-up" data-aos-delay="300">
              <h2 className="text-gradient mb-4">Our Values</h2>
              <div className="row g-4">
                <div className="col-md-4">
                  <h5 className="mb-3">
                    <i className="bi bi-heart-fill me-2" style={{ color: 'var(--cosmic-purple)' }}></i>
                    Authenticity
                  </h5>
                  <p className="text-muted">
                    We provide accurate, traditional Vedic astrology calculations based on time-tested principles.
                  </p>
                </div>
                <div className="col-md-4">
                  <h5 className="mb-3">
                    <i className="bi bi-shield-check me-2" style={{ color: 'var(--mystic-blue)' }}></i>
                    Privacy
                  </h5>
                  <p className="text-muted">
                    Your personal information and birth details are kept secure and private.
                  </p>
                </div>
                <div className="col-md-4">
                  <h5 className="mb-3">
                    <i className="bi bi-people-fill me-2" style={{ color: 'var(--soft-gold)' }}></i>
                    Accessibility
                  </h5>
                  <p className="text-muted">
                    Making spiritual wisdom accessible to everyone, regardless of background or knowledge.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact CTA */}
            <section className="text-center" data-aos="fade-up" data-aos-delay="400">
              <div className="cosmic-card-glass p-5">
                <h3 className="mb-3">Ready to Begin Your Journey?</h3>
                <p className="text-muted mb-4">
                  Join thousands who have discovered their cosmic blueprint and transformed their lives.
                </p>
                <a href="/" className="btn btn-cosmic btn-lg me-3">
                  Get Started
                </a>
                <a href="/contact" className="btn btn-cosmic-outline btn-lg">
                  Contact Us
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;







