import { Link } from 'react-router-dom';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './ReferBanner.module.css';

function ReferBanner() {
  const { t } = useLanguage();

  return (
    <section className={styles.referSection}>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className={`card ${styles.referCard}`}>
              <div className="card-body p-4 p-md-5 text-center">
                <div className={styles.icon}>🎁</div>
                <h2 className="display-5 fw-bold mb-3">{t('refer.title')}</h2>
                <p className="lead mb-4">
                  {t('refer.subtitle')}
                </p>
                <Link to="/refer" className="btn btn-accent btn-lg rounded-pill px-5">
                  {t('refer.inviteNow')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReferBanner;
