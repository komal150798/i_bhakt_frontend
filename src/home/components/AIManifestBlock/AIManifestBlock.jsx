import { useLanguage } from '../../../common/i18n/LanguageContext';
import HomeCtaPair from '../HomeCtaPair/HomeCtaPair';
import styles from './AIManifestBlock.module.css';

function AIManifestBlock() {
  const { t } = useLanguage();

  return (
    <section className={styles.section} data-aos="fade-up">
      <div className="container py-5">
        <div className={`row align-items-center g-5 ${styles.row}`}>
          <div className="col-lg-6">
            <p className={styles.eyebrow}>{t('landingAi.eyebrow')}</p>
            <h2 className={`page-hero-heading page-hero-heading--compact fw-bold mb-3 ${styles.title}`}>
              {t('landingAi.title')}
            </h2>
            <p className={`lead mb-4 ${styles.lead}`}>{t('landingAi.subtitle')}</p>
            <ul className={styles.list}>
              <li>{t('landingAi.bullet1')}</li>
              <li>{t('landingAi.bullet2')}</li>
              <li>{t('landingAi.bullet3')}</li>
            </ul>
          </div>
          <div className="col-lg-6">
            <div className={styles.card}>
              <div className={styles.cardGlow} aria-hidden />
              <h3 className={styles.cardTitle}>{t('landingAi.cardTitle')}</h3>
              <p className={styles.cardText}>{t('landingAi.cardBody')}</p>
              <HomeCtaPair
                className={styles.cardActions}
                primaryClassName={`btn btn-cosmic rounded-pill ${styles.cardCtaBtn}`}
                secondaryClassName={`btn btn-cosmic-outline rounded-pill ${styles.cardCtaBtn}`}
              />
              <p className={styles.cardFoot}>{t('landingAi.cardFoot')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIManifestBlock;
