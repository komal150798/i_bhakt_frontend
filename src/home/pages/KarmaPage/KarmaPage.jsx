import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import { useToast } from '../../../common/hooks/useToast';
import { handleApiError } from '../../../common/utils/apiErrorHandler';
import * as karmaApi from '../../../common/api/karmaApi';
import Loader from '../../../common/components/Loader/Loader';
import styles from './KarmaPage.module.css';

function KarmaPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [actionText, setActionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [karmaSummary, setKarmaSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Load karma summary on mount
  useEffect(() => {
    if (user?.id) {
      loadKarmaSummary();
    }
  }, [user?.id]);

  const loadKarmaSummary = async () => {
    if (!user?.id) return;

    setIsLoadingSummary(true);
    try {
      // Don't pass user_id - backend will use authenticated user's ID from token
      const summary = await karmaApi.getKarmaSummary();
      setKarmaSummary(summary);
    } catch (error) {
      console.warn('Failed to load karma summary:', error);
      // Don't show error toast for summary - it's optional
    } finally {
      setIsLoadingSummary(false);
    }
  };

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
      const result = await karmaApi.addKarmaAction({
        action_text: actionText.trim(),
      });

      showSuccess(t('karma.success.added'), {
        description: t('karma.success.addedDesc'),
      });

      // Clear form
      setActionText('');

      // Navigate to dashboard after successful addition
      navigate('/karma/dashboard');
    } catch (error) {
      const errorMessage = handleApiError(error);
      showError(t('karma.errors.addFailed'), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <div className={styles.karmaPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{t('karma.title')}</h1>
          <p className={styles.subtitle}>{t('karma.subtitle')}</p>
        </div>

        <div className={styles.content}>
          {/* Add Karma Form */}
          <div className={styles.formSection}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>{t('karma.form.title')}</h2>
              <p className={styles.cardDescription}>{t('karma.form.description')}</p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Action Text */}
                <div className={styles.formGroup}>
                  <label htmlFor="actionText" className={styles.label}>
                    {t('karma.form.actionText')} <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="actionText"
                    className={styles.textarea}
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    placeholder={t('karma.form.actionTextPlaceholder')}
                    rows={4}
                    required
                    disabled={isSubmitting}
                  />
                  <small className={styles.helpText}>{t('karma.form.actionTextHelp')}</small>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting || !actionText.trim()}
                >
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
          </div>

          {/* Karma Summary */}
          {isLoadingSummary ? (
            <div className={styles.summarySection}>
              <div className={styles.card}>
                <Loader />
              </div>
            </div>
          ) : karmaSummary ? (
            <div className={styles.summarySection}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>{t('karma.summary.title')}</h2>

                {/* Karma Score */}
                {karmaSummary.karma_score && (
                  <div className={styles.scoreCard}>
                    <div className={styles.scoreLabel}>{t('karma.summary.score')}</div>
                    <div className={styles.scoreValue}>
                      {karmaSummary.karma_score.current_score || 0}
                      <span className={styles.scoreMax}>/100</span>
                    </div>
                    {karmaSummary.karma_score.trend && (
                      <div className={styles.scoreTrend}>
                        {karmaSummary.karma_score.trend > 0 ? '↑' : karmaSummary.karma_score.trend < 0 ? '↓' : '→'}{' '}
                        {Math.abs(karmaSummary.karma_score.trend || 0)} points
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Actions */}
                {karmaSummary.recent_actions && karmaSummary.recent_actions.length > 0 && (
                  <div className={styles.recentActions}>
                    <h3 className={styles.sectionTitle}>{t('karma.summary.recentActions')}</h3>
                    <div className={styles.actionsList}>
                      {karmaSummary.recent_actions.slice(0, 5).map((action) => (
                        <div key={action.id} className={styles.actionItem}>
                          <div className={styles.actionText}>{action.text}</div>
                          <div className={styles.actionMeta}>
                            <span className={`${styles.actionType} ${styles[action.karma_type?.toLowerCase()]}`}>
                              {action.karma_type || 'neutral'}
                            </span>
                            {action.score && (
                              <span className={styles.actionScore}>
                                {action.score > 0 ? '+' : ''}
                                {action.score}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default KarmaPage;

