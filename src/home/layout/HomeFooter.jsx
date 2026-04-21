import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomeFooter.module.css';

const FOOTER_LINKS = {
  quick: [
    { path: '/', label: 'Home', icon: 'bi-house' },
    { path: '/manifestations', label: 'Manifestations', icon: 'bi-magic' },
    { path: '/karma', label: 'Karma', icon: 'bi-yin-yang' },
    { path: '/about', label: 'About Us', icon: 'bi-info-circle' },
    { path: '/contact', label: 'Contact', icon: 'bi-envelope' },
  ],
  legal: [
    { path: '/terms', label: 'Terms & Conditions' },
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/refund', label: 'Refund & Cancellation' },
    { path: '/pricing-policy', label: 'Pricing Policy' },
    { path: '/disclaimer', label: 'Disclaimer' },
  ],
};

const SOCIAL_LINKS = [
  { platform: 'instagram', icon: 'bi-instagram', url: 'https://www.instagram.com/ibhakt.app', label: 'Instagram' },
  { platform: 'youtube', icon: 'bi-youtube', url: 'https://youtube.com/@ibhakt', label: 'YouTube' },
  { platform: 'facebook', icon: 'bi-facebook', url: 'https://www.facebook.com/ibhakt.app', label: 'Facebook' },
  { platform: 'linkedin', icon: 'bi-linkedin', url: 'https://www.linkedin.com/company/ibhakt', label: 'LinkedIn' },
];

function HomeFooter() {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brandLink}>
              <img src="/ibhakt_logo.jpeg" alt="iBhakt" className={styles.brandLogo} />
              <span className={`${styles.brandName} brand-mark`}>iBhakt</span>
            </Link>
            <p className={styles.description}>
              Your cosmic companion for Kundli generation, manifestation tracking,
              and karma insights — powered by Vedic wisdom and modern technology.
            </p>
            <div className={styles.social}>
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`${styles.socialLink} ${styles[`social_${social.platform}`]}`}
                >
                  <i className={`bi ${social.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className={styles.linkCol}>
            {/* Desktop heading */}
            <h6 className={styles.sectionTitleDesktop}>Quick Links</h6>
            {/* Mobile accordion */}
            <button
              className={styles.accordionToggle}
              onClick={() => toggleSection('quick')}
              aria-expanded={openSection === 'quick'}
            >
              <span>Quick Links</span>
              <i className={`bi ${openSection === 'quick' ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
            </button>
            <ul className={`${styles.linkList} ${openSection === 'quick' ? styles.linkListOpen : ''}`}>
              {FOOTER_LINKS.quick.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>
                    <i className={`bi ${link.icon} ${styles.linkIcon}`} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links Column */}
          <div className={styles.linkCol}>
            <h6 className={styles.sectionTitleDesktop}>Legal</h6>
            <button
              className={styles.accordionToggle}
              onClick={() => toggleSection('legal')}
              aria-expanded={openSection === 'legal'}
            >
              <span>Legal</span>
              <i className={`bi ${openSection === 'legal' ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
            </button>
            <ul className={`${styles.linkList} ${openSection === 'legal' ? styles.linkListOpen : ''}`}>
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className={styles.divider} />

        <p className={styles.copyright}>
          &copy; {currentYear} iBhakt. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default HomeFooter;
