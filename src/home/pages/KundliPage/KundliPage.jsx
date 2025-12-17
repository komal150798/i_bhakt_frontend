import KundliForm from '../../components/KundliForm/KundliForm';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './KundliPage.module.css';

function KundliPage() {
  const { t } = useLanguage();

  return (
    <div className={styles.kundliPage}>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mx-auto text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">{t('kundli.title')}</h1>
            <p className="lead text-muted">
              {t('kundli.subtitle')}
            </p>
          </div>
        </div>
        <KundliForm />
      </div>
    </div>
  );
}

export default KundliPage;
