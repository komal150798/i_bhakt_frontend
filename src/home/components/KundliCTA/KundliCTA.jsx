import { Link } from 'react-router-dom';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import HomeCtaPair from '../HomeCtaPair/HomeCtaPair';
import styles from './KundliCTA.module.css';

function KundliCTA() {
  const { t } = useLanguage();

  return (
    <section className={styles.section} data-aos="fade-up">
      <div className="container py-4">
        <div className={styles.panel}>
          <div className={styles.content}>
            <span className={styles.badge}>{t('kundliTeaser.badge')}</span>
            <h2 className={`page-hero-heading page-hero-heading--compact fw-bold mb-2 ${styles.title}`}>
              {t('kundliTeaser.title')}
            </h2>
            <p className={styles.subtitle}>
              {t('kundliTeaser.subtitle')}{' '}
              <Link to="/kundli" className={styles.inlineLink}>
                {t('kundliTeaser.inlineCalculator')}
              </Link>
            </p>
            <p className={styles.micro}>{t('kundliTeaser.micro')}</p>
          </div>
          <div className={styles.cta}>
            <HomeCtaPair
              className={`d-flex flex-column flex-md-row gap-2 gap-md-3 align-items-stretch align-items-md-center justify-content-md-end ${styles.ctaPair}`}
              primaryClassName="btn btn-cosmic btn-lg rounded-pill px-4 px-md-5 w-100 w-md-auto"
              secondaryClassName="btn btn-cosmic-outline btn-lg rounded-pill px-4 px-md-5 w-100 w-md-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default KundliCTA;
