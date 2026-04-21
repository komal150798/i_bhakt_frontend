import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './ReferBanner.module.css';

function ReferBanner() {
  const { t } = useLanguage();

  const handleInvite = async () => {
    const shareUrl = window.location.origin;
    const shareText = 'Check out iBhakt - Generate your Kundli, manifest your desires, and track your karma journey!';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'iBhakt', text: shareText, url: shareUrl });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <section className={styles.referSection}>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className={`card ${styles.referCard}`}>
              <div className="card-body p-4 p-md-5 text-center">
                <div className={styles.icon}>🎁</div>
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">{t('refer.title')}</h2>
                <p className="lead mb-4">
                  {t('refer.subtitle')}
                </p>
                <button onClick={handleInvite} className="btn btn-cosmic btn-lg rounded-pill px-5">
                  {t('refer.inviteNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReferBanner;
