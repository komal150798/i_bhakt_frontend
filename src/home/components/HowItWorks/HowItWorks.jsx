import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './HowItWorks.module.css';

const STEPS = [
  { step: 1, iconClass: 'bi-bullseye', titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc' },
  { step: 2, iconClass: 'bi-diagram-3-fill', titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc' },
  { step: 3, iconClass: 'bi-person-bounding-box', titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc' },
  { step: 4, iconClass: 'bi-stars', titleKey: 'howItWorks.step4Title', descKey: 'howItWorks.step4Desc' },
];

function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className={styles.section} aria-labelledby="how-it-works-heading">
      <div className="container py-5">
        <header className={`text-center mb-5 ${styles.header}`} data-aos="fade-up">
          <p className={styles.eyebrow}>{t('howItWorks.eyebrow')}</p>
          <h2 id="how-it-works-heading" className="page-hero-heading page-hero-heading--compact fw-bold mb-3">
            {t('howItWorks.title')}
          </h2>
          <p className={`lead mx-auto ${styles.subtitle}`}>{t('howItWorks.subtitle')}</p>
        </header>

        <ol className={styles.track}>
          {STEPS.map((item, index) => (
            <li
              key={item.step}
              className={styles.step}
              data-aos="fade-up"
              data-aos-delay={index * 120}
            >
              <span className={styles.connector} aria-hidden />
              <div className={styles.card}>
                <div className={styles.iconWrap}>
                  <span className={styles.stepNum} aria-hidden>
                    {item.step}
                  </span>
                  <i className={`bi ${item.iconClass} ${styles.icon}`} aria-hidden />
                </div>
                <div className={styles.body}>
                  <h3 className={styles.stepTitle}>{t(item.titleKey)}</h3>
                  <p className={styles.stepDesc}>{t(item.descKey)}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
