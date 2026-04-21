import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './WhyIBhakt.module.css';

const ROWS = ['row1', 'row2', 'row3', 'row4'];

function WhyIBhakt() {
  const { t } = useLanguage();

  return (
    <section className={styles.section} aria-labelledby="why-ibhakt-heading">
      <div className="container py-5">
        <header className="text-center mb-5" data-aos="fade-up">
          <p className={styles.eyebrow}>{t('whyIBhakt.eyebrow')}</p>
          <h2 id="why-ibhakt-heading" className="page-hero-heading page-hero-heading--compact fw-bold mb-3">
            {t('whyIBhakt.title')}
          </h2>
          <p className={`lead mx-auto ${styles.subtitle}`}>{t('whyIBhakt.subtitle')}</p>
        </header>

        <div className={styles.tableWrap} data-aos="fade-up" data-aos-delay="80">
          <table className={styles.table}>
            <caption className="visually-hidden">{t('whyIBhakt.caption')}</caption>
            <thead>
              <tr>
                <th scope="col" className={styles.thOthers}>
                  {t('whyIBhakt.colOthers')}
                </th>
                <th scope="col" className={styles.thIBhakt}>
                  <span className="brand-mark">{t('whyIBhakt.colIBhakt')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((key, index) => (
                <tr key={key} data-aos="fade-up" data-aos-delay={100 + index * 60}>
                  <td className={styles.tdOthers}>{t(`whyIBhakt.${key}Others`)}</td>
                  <td className={styles.tdIBhakt}>{t(`whyIBhakt.${key}IBhakt`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default WhyIBhakt;
