import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './TrustSection.module.css';

const ITEMS = [
  { key: 'users', iconClass: 'bi-people-fill' },
  { key: 'ai', iconClass: 'bi-cpu-fill' },
  { key: 'secure', iconClass: 'bi-shield-lock-fill' },
  { key: 'wisdom', iconClass: 'bi-infinity' },
];

function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className={styles.section} aria-labelledby="trust-section-heading">
      <div className="container py-5">
        <header className="text-center mb-5" data-aos="fade-up">
          <h2 id="trust-section-heading" className="page-hero-heading page-hero-heading--compact fw-bold mb-3">
            {t('trustSection.title')}
          </h2>
          <p className={`lead mx-auto ${styles.subtitle}`}>{t('trustSection.subtitle')}</p>
        </header>

        <div className={styles.grid}>
          {ITEMS.map((item, index) => (
            <article
              key={item.key}
              className={styles.card}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className={styles.iconRing}>
                <i className={`bi ${item.iconClass} ${styles.icon}`} aria-hidden />
              </div>
              <h3 className={styles.cardTitle}>{t(`trustSection.${item.key}Title`)}</h3>
              <p className={styles.cardText}>{t(`trustSection.${item.key}Text`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
