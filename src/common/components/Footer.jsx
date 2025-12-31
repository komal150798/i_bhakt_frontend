import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const FOOTER_LINKS = {
  quick: [
    { path: '/', label: 'Home' },
    { path: '/kundli', label: 'Kundli' },
    { path: '/horoscope', label: 'Horoscope' },
    { path: '/refer', label: 'Refer & Earn' },
  ],
  legal: [
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
    { path: '/about', label: 'About' },
  ],
};

const SOCIAL_LINKS = [
  { icon: 'bi-facebook', url: '#', label: 'Facebook' },
  { icon: 'bi-twitter', url: '#', label: 'Twitter' },
  { icon: 'bi-instagram', url: '#', label: 'Instagram' },
  { icon: 'bi-youtube', url: '#', label: 'YouTube' },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className={styles.logo}>AstroVerse</h5>
            <p className={styles.description}>
              Your trusted companion for accurate astrology predictions, kundli generation,
              and spiritual guidance.
            </p>
          </div>

          <div className="col-lg-4">
            <h6 className={styles.sectionTitle}>Quick Links</h6>
            <ul className={styles.linkList}>
              {FOOTER_LINKS.quick.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-4">
            <h6 className={styles.sectionTitle}>Legal</h6>
            <ul className={styles.linkList}>
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
            <div className={styles.social}>
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  aria-label={social.label}
                  className={styles.socialLink}
                >
                  <i className={`bi ${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className="row">
          <div className="col-12 text-center">
            <p className={styles.copyright}>
              &copy; {currentYear} ibhakt. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

