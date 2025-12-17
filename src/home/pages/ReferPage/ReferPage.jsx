import { useState, useEffect } from 'react';
import { homeApi } from '../../../api/homeApi';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import Loader from '../../../common/components/Loader/Loader';
import styles from './ReferPage.module.css';

function ReferPage() {
  const { t } = useLanguage();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codeData, statsData] = await Promise.all([
          homeApi.getReferralCode(),
          homeApi.getReferralStats(),
        ]);
        setReferralCode(codeData.code);
        setStats(statsData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load referral data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyToClipboard = () => {
    const url = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    alert('Referral link copied to clipboard!');
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className={styles.referPage}>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <h1 className="display-4 fw-bold mb-3 text-center">{t('refer.title')}</h1>
            <p className="lead text-muted text-center mb-5">
              {t('refer.subtitle')}
            </p>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="card mb-4">
              <div className="card-body p-4 text-center">
                <h3 className="mb-3">{t('refer.yourCode')}</h3>
                <div className={styles.codeDisplay}>
                  <code className={styles.code}>{referralCode}</code>
                </div>
                <button className="btn btn-primary mt-3" onClick={copyToClipboard}>
                  {t('refer.copyLink')}
                </button>
              </div>
            </div>

            {stats && (
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card text-center">
                    <div className="card-body">
                      <h3 className="text-primary">{stats.totalReferrals || 0}</h3>
                      <p className="text-muted mb-0">{t('refer.totalReferrals')}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center">
                    <div className="card-body">
                      <h3 className="text-success">{stats.successfulReferrals || 0}</h3>
                      <p className="text-muted mb-0">{t('refer.successfulSignups')}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center">
                    <div className="card-body">
                      <h3 className="text-accent">{stats.earnings || '$0'}</h3>
                      <p className="text-muted mb-0">{t('refer.totalEarnings')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferPage;
