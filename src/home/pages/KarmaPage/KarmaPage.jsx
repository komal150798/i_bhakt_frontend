import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import { useToast } from '../../../common/hooks/useToast';
import { handleApiError } from '../../../common/utils/apiErrorHandler';
import * as karmaApi from '../../../common/api/karmaApi';
import Loader from '../../../common/components/Loader/Loader';
import { KarmaDashboardBody } from '../KarmaDashboard/KarmaDashboardBody';
import dashStyles from '../KarmaDashboard/KarmaDashboardPage.module.css';
import styles from './KarmaPage.module.css';

function KarmaPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [actionText, setActionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);

  /** Refresh after add karma (intentional; no abort). */
  const refreshDashboard = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingDashboard(true);
    try {
      const data = await karmaApi.getKarmaDashboard({ force: true });
      setDashboardData(data);
    } catch (error) {
      console.warn('Failed to load karma dashboard:', error);
      const errorMessage = handleApiError(error);
      showError(t('karma.dashboard.loadFailed'), {
        description: errorMessage,
      });
      setDashboardData(null);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [user?.id, showError, t]);

  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || !user)) {
      navigate('/login');
    }
  }, [isAuthLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    setIsLoadingDashboard(true);
    karmaApi
      .getKarmaDashboard()
      .then((data) => {
        if (!cancelled) setDashboardData(data);
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('Failed to load karma dashboard:', error);
        const errorMessage = handleApiError(error);
        showError(t('karma.dashboard.loadFailed'), {
          description: errorMessage,
        });
        setDashboardData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDashboard(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, showError, t]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowAddPanel(false);
    };
    if (showAddPanel) {
      window.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [showAddPanel]);

  const openAddPanel = () => setShowAddPanel(true);

  const closeAddPanel = () => setShowAddPanel(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!actionText.trim()) {
      showError(t('karma.errors.actionRequired'), {
        description: t('karma.errors.actionRequiredDesc'),
      });
      return;
    }

    if (!user?.id) {
      showError(t('karma.errors.notAuthenticated'));
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      await karmaApi.addKarmaAction({
        action_text: actionText.trim(),
      });

      showSuccess(t('karma.success.added'), {
        description: t('karma.success.addedDesc'),
      });

      setActionText('');
      closeAddPanel();
      await refreshDashboard();
    } catch (error) {
      const errorMessage = handleApiError(error);
      showError(t('karma.errors.addFailed'), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className={styles.mainCard}>
        <div className={styles.mainCardLoader}>
          <Loader />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const mainBlock = isLoadingDashboard ? (
    <div className={styles.mainCard}>
      <div className={styles.mainCardLoader}>
        <Loader />
      </div>
    </div>
  ) : !dashboardData ? (
    <div className={dashStyles.container}>
      <div className={dashStyles.errorCard}>
        <p>{t('karma.dashboard.noData')}</p>
        <button type="button" onClick={openAddPanel} className={dashStyles.addKarmaBtn}>
          {t('karma.dashboard.addFirstKarma')}
        </button>
      </div>
    </div>
  ) : (
    <KarmaDashboardBody dashboardData={dashboardData} onAddKarma={openAddPanel} embedded />
  );

  return (
    <div className={styles.karmaShell}>
      <div className={styles.shellInner}>
        <header className={styles.pageHeader}>
          <div>
            <h1 className={`page-hero-heading page-hero-heading--compact ${styles.pageTitle}`}>
              {t('karma.dashboard.title')}
            </h1>
            <p className={styles.pageSubtitle}>{t('karma.subtitle')}</p>
          </div>
          <button type="button" className={styles.headerAddBtn} onClick={openAddPanel}>
            <span className={styles.headerAddIcon}>+</span>
            {t('karma.sidebar.addKarma')}
          </button>
        </header>

        <main className={styles.mainFull}>{mainBlock}</main>
      </div>

      {showAddPanel && (
        <div
          className={styles.panelOverlay}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAddPanel();
          }}
        >
          <aside className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="karma-panel-title">
            <div className={styles.panelHeader}>
              <h2 id="karma-panel-title" className={styles.panelTitle}>
                {t('karma.form.title')}
              </h2>
              <button type="button" className={styles.panelClose} onClick={closeAddPanel} aria-label={t('karma.panel.close')}>
                ×
              </button>
            </div>
            <div className={styles.panelBody}>
              <p className={styles.panelIntro}>{t('karma.form.description')}</p>
              <form onSubmit={handleSubmit} className={styles.panelForm}>
                <div className={styles.panelFormGroup}>
                  <label htmlFor="karmaActionText" className={styles.panelLabel}>
                    {t('karma.form.actionText')} <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="karmaActionText"
                    className={styles.panelTextarea}
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    placeholder={t('karma.form.actionTextPlaceholder')}
                    rows={5}
                    required
                    disabled={isSubmitting}
                  />
                  <small className={styles.panelHelp}>{t('karma.form.actionTextHelp')}</small>
                </div>
                <button type="submit" className={styles.panelSubmit} disabled={isSubmitting || !actionText.trim()}>
                  {isSubmitting ? (
                    <>
                      <Loader size="sm" />
                      <span>{t('karma.form.submitting')}</span>
                    </>
                  ) : (
                    t('karma.form.submit')
                  )}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {!showAddPanel && (
        <button type="button" className={styles.floatingAdd} onClick={openAddPanel} aria-label={t('karma.sidebar.addKarma')}>
          +
        </button>
      )}
    </div>
  );
}

export default KarmaPage;
