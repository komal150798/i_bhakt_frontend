import { Link } from 'react-router-dom';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './FeatureSection.module.css';

function renderTitleWithBrand(text) {
  return text.split(/(iBhakt)/g).map((part, i) =>
    part === 'iBhakt' ? (
      <span key={i} className="brand-mark">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function FeatureSection() {
  const { t } = useLanguage();

  const FEATURES = [
    {
      id: 1,
      iconClass: 'bi-person-bounding-box',
      titleKey: 'features.cosmicDigitalTwin.title',
      descriptionKey: 'features.cosmicDigitalTwin.description',
      link: '/manifestations',
    },
    {
      id: 2,
      icon: '✨',
      titleKey: 'features.manifestation.title',
      descriptionKey: 'features.manifestation.description',
      link: '/manifestations',
    },
    {
      id: 3,
      icon: '⚖️',
      titleKey: 'features.karmaLedger.title',
      descriptionKey: 'features.karmaLedger.description',
      link: '/karma',
    },
    {
      id: 4,
      icon: '🧘',
      titleKey: 'features.cosmicGuidance.title',
      descriptionKey: 'features.cosmicGuidance.description',
      link: '/about',
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container py-5">
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">
              {renderTitleWithBrand(t('features.title'))}
            </h2>
            <p className="lead" style={{ color: 'var(--text-secondary)' }}>
              {t('features.subtitle')}
            </p>
          </div>
        </div>

        <div className="row g-4">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="col-md-6 col-lg-3">
              <Link to={feature.link} className={styles.cardLink}>
                <div className={`card h-100 ${styles.featureCard}`}>
                  <div className="card-body text-center p-4">
                    <div className={styles.icon}>
                      {feature.iconClass ? (
                        <i className={`bi ${feature.iconClass}`} aria-hidden />
                      ) : (
                        feature.icon
                      )}
                    </div>
                    <h5 className="card-title fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t(feature.titleKey)}</h5>
                    <p className="card-text" style={{ color: 'var(--text-secondary)' }}>{t(feature.descriptionKey)}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
