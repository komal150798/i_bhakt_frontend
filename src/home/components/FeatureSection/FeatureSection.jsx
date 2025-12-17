import { Link } from 'react-router-dom';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './FeatureSection.module.css';

function FeatureSection() {
  const { t } = useLanguage();

  const FEATURES = [
    {
      id: 1,
      icon: '🔯',
      titleKey: 'features.freeKundli.title',
      descriptionKey: 'features.freeKundli.description',
      link: '/kundli',
    },
    {
      id: 2,
      icon: '📅',
      titleKey: 'features.dailyHoroscope.title',
      descriptionKey: 'features.dailyHoroscope.description',
      link: '/horoscope',
    },
    {
      id: 3,
      icon: '💑',
      titleKey: 'features.matchmaking.title',
      descriptionKey: 'features.matchmaking.description',
      link: '/matchmaking',
    },
    {
      id: 4,
      icon: '🔮',
      titleKey: 'features.tarotReading.title',
      descriptionKey: 'features.tarotReading.description',
      link: '/tarot',
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container py-5">
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <h2 className="display-5 fw-bold mb-3">{t('features.title')}</h2>
            <p className="lead text-muted">
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
                    <div className={styles.icon}>{feature.icon}</div>
                    <h5 className="card-title fw-bold mb-3">{t(feature.titleKey)}</h5>
                    <p className="card-text text-muted">{t(feature.descriptionKey)}</p>
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
