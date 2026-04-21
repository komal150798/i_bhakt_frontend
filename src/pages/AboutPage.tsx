import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import { useTranslation } from '../common/hooks/useTranslation.js';
import styles from './AboutPage.module.css';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const FounderPhoto: React.FC<{ src: string; alt: string; initials: string }> = ({ src, alt, initials }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.photoShell}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          className={styles.photoImg}
          loading="lazy"
          width={320}
          height={400}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={styles.photoFallback} aria-hidden>
          <span className={styles.photoInitials}>{initials}</span>
        </div>
      )}
    </div>
  );
};

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

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
              <h1 className="page-hero-heading fw-bold mb-4">
                About <span className="brand-mark">iBhakt</span>
              </h1>
              <p className="lead page-hero-subtitle">
                Your cosmic companion for spiritual growth and manifestation
              </p>
            </div>

            {/* Founders — Prachi Surve & Rahul Gudadhe; why created + vision */}
            <section
              className={`cosmic-card mb-5 ${styles.founderSection}`}
              data-aos="fade-up"
              data-aos-delay="80"
              aria-labelledby="founder-section-title"
            >
              <p className={styles.founderEyebrow}>{t('aboutPage.founder.eyebrow')}</p>
              <h2 id="founder-section-title" className={`page-hero-heading page-hero-heading--compact fw-bold text-center ${styles.founderTitle}`}>
                {t('aboutPage.founder.sectionTitle')}
              </h2>
              <p className={styles.founderIntro}>{t('aboutPage.founder.intro')}</p>
              <div className="row g-4 justify-content-center mb-2">
                <div className="col-md-6 col-lg-5">
                  <div className={styles.founderCard}>
                    <FounderPhoto
                      src={asset('images/founder-prachi.jpg')}
                      alt={t('aboutPage.founder.prachi.photoAlt')}
                      initials={t('aboutPage.founder.prachi.initials')}
                    />
                    <h3 className={styles.founderName}>{t('aboutPage.founder.prachi.name')}</h3>
                    <p className={styles.founderRole}>{t('aboutPage.founder.prachi.role')}</p>
                    <p className={styles.founderCardBio}>{t('aboutPage.founder.prachi.bio')}</p>
                  </div>
                </div>
                <div className="col-md-6 col-lg-5">
                  <div className={styles.founderCard}>
                    <FounderPhoto
                      src={asset('images/founder-rahul.jpg')}
                      alt={t('aboutPage.founder.rahul.photoAlt')}
                      initials={t('aboutPage.founder.rahul.initials')}
                    />
                    <h3 className={styles.founderName}>{t('aboutPage.founder.rahul.name')}</h3>
                    <p className={styles.founderRole}>{t('aboutPage.founder.rahul.role')}</p>
                    <p className={styles.founderCardBio}>{t('aboutPage.founder.rahul.bio')}</p>
                  </div>
                </div>
              </div>
              <div className={styles.founderCalloutsWrap}>
                <div className={styles.callouts}>
                  <div className={styles.callout}>
                    <h4 className={styles.calloutTitle}>
                      <i className="bi bi-stars" aria-hidden />
                      {t('aboutPage.founder.whyTitle')}
                    </h4>
                    <p className={styles.calloutBody}>{t('aboutPage.founder.whyBody')}</p>
                  </div>
                  <div className={styles.callout}>
                    <h4 className={styles.calloutTitle}>
                      <i className="bi bi-eye" aria-hidden />
                      {t('aboutPage.founder.visionTitle')}
                    </h4>
                    <p className={styles.calloutBody}>{t('aboutPage.founder.visionBody')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Mission Section */}
            <section className="cosmic-card mb-5" data-aos="fade-up" data-aos-delay="100">
              <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-4">Our Mission</h2>
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
              <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-4 text-center">What We Offer</h2>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="cosmic-card h-100">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        <i className="bi bi-person-bounding-box" style={{ fontSize: '2.5rem', color: 'var(--cosmic-purple)' }}></i>
                      </div>
                      <div>
                        <h4 className="mb-2">Cosmic Digital Twin</h4>
                        <p className="text-muted mb-0">
                          Create a real-time, interactive digital model of your personal cosmic state, combining your natal chart and planetary transits to help visualize alignment, simulate future scenarios, and guide conscious growth.
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
              <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-4">Our Values</h2>
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
