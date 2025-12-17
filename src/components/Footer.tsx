import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="py-5 position-relative" style={{ 
      background: 'var(--bg-secondary)', 
      borderTop: '1px solid var(--card-border)',
      marginTop: '80px'
    }}>
      <div className="container">
        <div className="row g-4">
          {/* Corporate Info */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-gradient mb-3 fw-bold">{t('footer.corporate')}</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/about" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-shield-check me-2"></i>
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-file-text me-2"></i>
                  {t('footer.termsConditions')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/refund" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  {t('footer.refundPolicy')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/pricing-policy" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-tag me-2"></i>
                  {t('footer.pricingPolicy')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/disclaimer" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {t('footer.disclaimer')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-gradient mb-3 fw-bold">{t('footer.quickLinks')}</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/kundli" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-stars me-2"></i>
                  {t('nav.kundli')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/dosha" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-circle me-2"></i>
                  {t('footer.dosha')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/yog" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-infinity me-2"></i>
                  {t('footer.yog')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/marriage" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-heart me-2"></i>
                  {t('footer.marriage')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/numerology" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-123 me-2"></i>
                  {t('footer.numerology')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/tarot" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-suit-spade me-2"></i>
                  {t('footer.tarot')}
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/blog" className="text-decoration-none" style={{ color: 'var(--text-secondary)' }}>
                  <i className="bi bi-journal-text me-2"></i>
                  {t('footer.blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-gradient mb-3 fw-bold">{t('footer.contact')}</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-envelope me-2 mt-1" style={{ color: 'var(--cosmic-purple)' }}></i>
                <div>
                  <small className="text-muted d-block">{t('footer.email')}</small>
                  <a href="mailto:support@ibhakt.com" className="text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                    support@ibhakt.com
                  </a>
                </div>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-telephone me-2 mt-1" style={{ color: 'var(--cosmic-purple)' }}></i>
                <div>
                  <small className="text-muted d-block">{t('footer.phone')}</small>
                  <a href="tel:+911234567890" className="text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                    +91 123 456 7890
                  </a>
                </div>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-geo-alt me-2 mt-1" style={{ color: 'var(--cosmic-purple)' }}></i>
                <div>
                  <small className="text-muted d-block">{t('footer.address')}</small>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    123 Spiritual Street,<br />
                    Mumbai, Maharashtra 400001
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Social & Settings */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-gradient mb-3 fw-bold">{t('footer.followUs')}</h5>
            <div className="d-flex gap-3 mb-4">
              <a 
                href="https://instagram.com" 
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
                  color: 'var(--text-primary)'
                }}
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a 
                href="https://youtube.com" 
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
                  color: 'var(--text-primary)'
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
                  color: 'var(--text-primary)'
                }}
              >
                <i className="bi bi-facebook"></i>
              </a>
              <a 
                href="https://twitter.com" 
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
                  color: 'var(--text-primary)'
                }}
              >
                <i className="bi bi-twitter-x"></i>
              </a>
            </div>

            {/* Theme & Language Toggle */}
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'var(--bg-tertiary)' }}>
                <LanguageSwitcher />
                <span className="text-muted small d-none d-sm-inline">Language</span>
              </div>
              <button
                className="btn btn-sm w-100 d-flex align-items-center gap-2 justify-content-start"
                onClick={toggleTheme}
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: 'none', 
                  color: 'var(--text-primary)' 
                }}
              >
                {theme === 'light' ? (
                  <>
                    <i className="bi bi-moon-stars-fill"></i>
                    <span className="d-none d-sm-inline">Dark Mode</span>
                    <span className="d-sm-none">Dark</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-sun-fill"></i>
                    <span className="d-none d-sm-inline">Light Mode</span>
                    <span className="d-sm-none">Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--card-border)', margin: '2rem 0 1rem' }} />

        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <p className="mb-0 text-muted">
              &copy; {new Date().getFullYear()} <span className="text-gradient fw-bold">iBhakt</span>. {t('footer.copyright')}.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <Link to="/contact" className="text-decoration-none me-3" style={{ color: 'var(--text-secondary)' }}>
              <i className="bi bi-envelope me-1"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

