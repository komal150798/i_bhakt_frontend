import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './TrustStrip.module.css';

const TRUST_KEYS = ['trust1', 'trust2', 'trust3', 'trust4'];

function TrustStrip() {
  const { t } = useLanguage();

  return (
    <section className={styles.strip} aria-label={t('trust.sectionLabel')}>
      <div className="container">
        <div className={styles.grid}>
          {TRUST_KEYS.map((key, index) => (
            <div key={key} className={styles.item} data-aos="fade-up" data-aos-delay={index * 80}>
              <span className={styles.dot} aria-hidden />
              <span className={styles.text}>{t(`trust.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustStrip;
