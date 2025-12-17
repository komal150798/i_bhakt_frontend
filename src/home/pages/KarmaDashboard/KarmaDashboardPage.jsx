import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import { useToast } from '../../../common/hooks/useToast';
import { handleApiError } from '../../../common/utils/apiErrorHandler';
import * as karmaApi from '../../../common/api/karmaApi';
import Loader from '../../../common/components/Loader/Loader';
import styles from './KarmaDashboardPage.module.css';

function KarmaDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { showError } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Load dashboard data on mount
  useEffect(() => {
    if (user?.id) {
      loadDashboard();
    }
  }, [user?.id]);

  const loadDashboard = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await karmaApi.getKarmaDashboard();
      setDashboardData(data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      showError(t('karma.dashboard.loadFailed'), {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.container}>
          <Loader fullScreen />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <p>{t('karma.dashboard.noData')}</p>
            <button onClick={() => navigate('/karma')} className={styles.addKarmaBtn}>
              {t('karma.dashboard.addFirstKarma')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { overall, breakdown, categories, recent_actions, patterns, improvement_plan, trends } = dashboardData;

  // Calculate good/bad ratio for progress bar
  const totalPoints = breakdown.good.points + breakdown.bad.points;
  const goodPercentage = totalPoints > 0 ? (breakdown.good.points / totalPoints) * 100 : 50;

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{t('karma.dashboard.title')}</h1>
          <p className={styles.subtitle}>
            {t('karma.dashboard.subtitle', {
              from: overall.time_range.from,
              to: overall.time_range.to,
            })}
          </p>
        </div>

        {/* Score Card (Hero) */}
        <div className={styles.scoreHeroCard}>
          <div className={styles.scoreCircle}>
            <div className={styles.scoreValue}>{overall.score}</div>
            <div className={styles.scoreMax}>/ 100</div>
            <div className={`${styles.scoreGrade} ${styles[`grade${overall.grade.replace('+', 'Plus').replace('-', 'Minus')}`]}`}>
              {overall.grade}
            </div>
          </div>
          <div className={styles.scoreInfo}>
            <div className={styles.trendIndicator}>
              {overall.trend === 'up' && <span className={styles.trendUp}>↑</span>}
              {overall.trend === 'down' && <span className={styles.trendDown}>↓</span>}
              {overall.trend === 'flat' && <span className={styles.trendFlat}>→</span>}
              <span className={styles.trendText}>
                {overall.trend === 'up' && t('karma.dashboard.trendUp')}
                {overall.trend === 'down' && t('karma.dashboard.trendDown')}
                {overall.trend === 'flat' && t('karma.dashboard.trendFlat')}
              </span>
            </div>
            <div className={styles.totalActions}>
              {t('karma.dashboard.totalActions', { count: overall.total_actions })}
            </div>
            {trends?.weekly && (
              <div className={styles.weeklyChange}>
                {t('karma.dashboard.weeklyChange')}:{' '}
                <span className={trends.weekly.change >= 0 ? styles.positive : styles.negative}>
                  {trends.weekly.change >= 0 ? '+' : ''}
                  {trends.weekly.change.toFixed(1)} points
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Good vs Bad Karma Summary */}
        <div className={styles.breakdownSection}>
          <h2 className={styles.sectionTitle}>{t('karma.dashboard.breakdown')}</h2>
          <div className={styles.breakdownCards}>
            <div className={`${styles.breakdownCard} ${styles.goodCard}`}>
              <div className={styles.breakdownIcon}>✨</div>
              <div className={styles.breakdownLabel}>{t('karma.dashboard.goodKarma')}</div>
              <div className={styles.breakdownCount}>{breakdown.good.count}</div>
              <div className={styles.breakdownPoints}>+{breakdown.good.points} points</div>
            </div>
            <div className={`${styles.breakdownCard} ${styles.badCard}`}>
              <div className={styles.breakdownIcon}>⚠️</div>
              <div className={styles.breakdownLabel}>{t('karma.dashboard.badKarma')}</div>
              <div className={styles.breakdownCount}>{breakdown.bad.count}</div>
              <div className={styles.breakdownPoints}>-{breakdown.bad.points} points</div>
            </div>
            <div className={`${styles.breakdownCard} ${styles.neutralCard}`}>
              <div className={styles.breakdownIcon}>➖</div>
              <div className={styles.breakdownLabel}>{t('karma.dashboard.neutralKarma')}</div>
              <div className={styles.breakdownCount}>{breakdown.neutral.count}</div>
              <div className={styles.breakdownPoints}>0 points</div>
            </div>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${goodPercentage}%` }}
              ></div>
            </div>
            <div className={styles.progressBarLabels}>
              <span>{t('karma.dashboard.goodKarma')}: {goodPercentage.toFixed(1)}%</span>
              <span>{t('karma.dashboard.badKarma')}: {(100 - goodPercentage).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Per Category Score */}
        {categories && categories.length > 0 && (
          <div className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>{t('karma.dashboard.categories')}</h2>
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <div key={category.category_slug} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <h3 className={styles.categoryName}>{category.category_name}</h3>
                    <span className={`${styles.categoryStatus} ${styles[category.status.toLowerCase().replace(' ', '')]}`}>
                      {category.status}
                    </span>
                  </div>
                  <div className={styles.categoryScore}>
                    <span className={styles.categoryScoreValue}>{category.score}</span>
                    <span className={styles.categoryScoreMax}>/ 100</span>
                  </div>
                  <div className={styles.categoryBreakdown}>
                    <span className={styles.categoryGood}>+{category.good_points}</span>
                    <span className={styles.categoryBad}>-{category.bad_points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Karma Actions */}
        {recent_actions && recent_actions.length > 0 && (
          <div className={styles.recentActionsSection}>
            <h2 className={styles.sectionTitle}>{t('karma.dashboard.recentActions')}</h2>
            <div className={styles.actionsTable}>
              <div className={styles.actionsTableHeader}>
                <div>{t('karma.dashboard.date')}</div>
                <div>{t('karma.dashboard.action')}</div>
                <div>{t('karma.dashboard.type')}</div>
                <div>{t('karma.dashboard.score')}</div>
              </div>
              {recent_actions.map((action, index) => (
                <div key={index} className={styles.actionsTableRow}>
                  <div className={styles.actionDate}>
                    {new Date(action.entry_date).toLocaleDateString()}
                  </div>
                  <div className={styles.actionText}>{action.text}</div>
                  <div>
                    <span className={`${styles.actionTypeBadge} ${styles[action.karma_type]}`}>
                      {action.karma_type}
                    </span>
                  </div>
                  <div className={`${styles.actionScore} ${action.score >= 0 ? styles.positive : styles.negative}`}>
                    {action.score >= 0 ? '+' : ''}
                    {action.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className={styles.patternsSection}>
          <div className={styles.patternsGrid}>
            {/* Strengths */}
            <div className={styles.patternsColumn}>
              <h2 className={styles.patternsTitle}>{t('karma.dashboard.strengths')}</h2>
              {patterns.strengths && patterns.strengths.length > 0 ? (
                patterns.strengths.map((strength, index) => (
                  <div key={index} className={`${styles.patternCard} ${styles.strengthCard}`}>
                    <div className={styles.patternHeader}>
                      <span className={styles.patternIcon}>⭐</span>
                      <h3 className={styles.patternLabel}>{strength.label}</h3>
                    </div>
                    <p className={styles.patternDescription}>{strength.description}</p>
                    <div className={styles.patternStats}>
                      <span>{t('karma.dashboard.frequency')}: {strength.frequency}x</span>
                      <span>{t('karma.dashboard.impact')}: +{strength.impact}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noPatterns}>{t('karma.dashboard.noStrengths')}</div>
              )}
            </div>

            {/* Weaknesses */}
            <div className={styles.patternsColumn}>
              <h2 className={styles.patternsTitle}>{t('karma.dashboard.weaknesses')}</h2>
              {patterns.weaknesses && patterns.weaknesses.length > 0 ? (
                patterns.weaknesses.map((weakness, index) => (
                  <div key={index} className={`${styles.patternCard} ${styles.weaknessCard}`}>
                    <div className={styles.patternHeader}>
                      <span className={styles.patternIcon}>⚠️</span>
                      <h3 className={styles.patternLabel}>{weakness.label}</h3>
                    </div>
                    <p className={styles.patternDescription}>{weakness.description}</p>
                    <div className={styles.patternStats}>
                      <span>{t('karma.dashboard.frequency')}: {weakness.frequency}x</span>
                      <span>{t('karma.dashboard.impact')}: {weakness.impact}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noPatterns}>{t('karma.dashboard.noWeaknesses')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Improvement Plan */}
        {improvement_plan && (
          <div className={styles.improvementSection}>
            <h2 className={styles.sectionTitle}>{t('karma.dashboard.improvementPlan')}</h2>
            <div className={styles.improvementCard}>
              <p className={styles.improvementSummary}>{improvement_plan.summary}</p>
              {improvement_plan.motivational_quote && (
                <div className={styles.motivationalQuote}>
                  <span className={styles.quoteIcon}>💫</span>
                  <p>{improvement_plan.motivational_quote}</p>
                </div>
              )}
              {improvement_plan.recommendations && improvement_plan.recommendations.length > 0 && (
                <div className={styles.recommendationsList}>
                  <h3 className={styles.recommendationsTitle}>{t('karma.dashboard.recommendations')}</h3>
                  {improvement_plan.recommendations.map((rec, index) => (
                    <div key={index} className={styles.recommendationCard}>
                      <div className={styles.recommendationHeader}>
                        <span className={styles.recommendationNumber}>{index + 1}</span>
                        <h4 className={styles.recommendationTitle}>{rec.title}</h4>
                      </div>
                      <p className={styles.recommendationDescription}>{rec.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className={styles.actionSection}>
          <button onClick={() => navigate('/karma')} className={styles.addKarmaBtn}>
            {t('karma.dashboard.addMoreKarma')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default KarmaDashboardPage;


