import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './KarmaDashboardPage.module.css';

/**
 * Full karma analytics UI — embedded on /karma (same pattern as Manifestation dashboard on one route).
 */
export function KarmaDashboardBody({ dashboardData, onAddKarma, embedded = false }) {
  const { t } = useLanguage();

  if (!dashboardData) {
    return null;
  }

  const { overall, breakdown, categories, recent_actions, patterns, improvement_plan, trends } = dashboardData;

  const safePatterns = patterns || { strengths: [], weaknesses: [] };

  const totalPoints = (breakdown?.good?.points ?? 0) + (breakdown?.bad?.points ?? 0);
  const goodPercentage = totalPoints > 0 ? (breakdown.good.points / totalPoints) * 100 : 50;

  return (
    <div className={embedded ? styles.embeddedRoot : undefined}>
      <div className={styles.container}>
        {!embedded && (
          <div className={styles.header}>
            <h1 className={`page-hero-heading page-hero-heading--compact ${styles.title}`}>
              {t('karma.dashboard.title')}
            </h1>
            <p className={styles.subtitle}>
              {t('karma.dashboard.subtitle', {
                from: overall.time_range.from,
                to: overall.time_range.to,
              })}
            </p>
          </div>
        )}

        {embedded && (
          <p className={styles.embeddedRange}>
            {t('karma.dashboard.subtitle', {
              from: overall.time_range.from,
              to: overall.time_range.to,
            })}
          </p>
        )}

        <div className={styles.scoreHeroCard}>
          <div className={styles.scoreCircle}>
            <div className={styles.scoreValue}>{overall.score}</div>
            <div className={styles.scoreMax}>/ 100</div>
            <div
              className={`${styles.scoreGrade} ${styles[`grade${overall.grade.replace('+', 'Plus').replace('-', 'Minus')}`]}`}
            >
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

        <div className={styles.breakdownSection}>
          <h2 className={styles.sectionTitle}>{t('karma.dashboard.breakdown')}</h2>
          <div className={styles.breakdownCards}>
            <div className={`${styles.breakdownCard} ${styles.goodCard}`}>
              <div className={styles.breakdownIcon}>✨</div>
              <div className={styles.breakdownLabel}>{t('karma.dashboard.goodKarma')}</div>
              <div className={styles.breakdownCount}>{breakdown?.good?.count ?? 0}</div>
              <div className={styles.breakdownPoints}>+{breakdown?.good?.points ?? 0} points</div>
            </div>
            <div className={`${styles.breakdownCard} ${styles.badCard}`}>
              <div className={styles.breakdownIcon}>⚠️</div>
              <div className={styles.breakdownLabel}>{t('karma.dashboard.badKarma')}</div>
              <div className={styles.breakdownCount}>{breakdown?.bad?.count ?? 0}</div>
              <div className={styles.breakdownPoints}>-{breakdown?.bad?.points ?? 0} points</div>
            </div>
            <div className={`${styles.breakdownCard} ${styles.neutralCard}`}>
              <div className={styles.breakdownIcon}>➖</div>
              <div className={styles.breakdownLabel}>{t('karma.dashboard.neutralKarma')}</div>
              <div className={styles.breakdownCount}>{breakdown?.neutral?.count ?? 0}</div>
              <div className={styles.breakdownPoints}>0 points</div>
            </div>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} style={{ width: `${goodPercentage}%` }}></div>
            </div>
            <div className={styles.progressBarLabels}>
              <span>
                {t('karma.dashboard.goodKarma')}: {goodPercentage.toFixed(1)}%
              </span>
              <span>
                {t('karma.dashboard.badKarma')}: {(100 - goodPercentage).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>{t('karma.dashboard.categories')}</h2>
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <div key={category.category_slug} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <h3 className={styles.categoryName}>{category.category_name}</h3>
                    <span
                      className={`${styles.categoryStatus} ${styles[category.status.toLowerCase().replace(' ', '')]}`}
                    >
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
                  <div className={styles.actionDate}>{new Date(action.entry_date).toLocaleDateString()}</div>
                  <div className={styles.actionText}>{action.text}</div>
                  <div>
                    <span className={`${styles.actionTypeBadge} ${styles[action.karma_type]}`}>{action.karma_type}</span>
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

        <div className={styles.patternsSection}>
          <div className={styles.patternsGrid}>
            <div className={styles.patternsColumn}>
              <h2 className={styles.patternsTitle}>{t('karma.dashboard.strengths')}</h2>
              {safePatterns.strengths && safePatterns.strengths.length > 0 ? (
                safePatterns.strengths.map((strength, index) => (
                  <div key={index} className={`${styles.patternCard} ${styles.strengthCard}`}>
                    <div className={styles.patternHeader}>
                      <span className={styles.patternIcon}>⭐</span>
                      <h3 className={styles.patternLabel}>{strength.label}</h3>
                    </div>
                    <p className={styles.patternDescription}>{strength.description}</p>
                    <div className={styles.patternStats}>
                      <span>
                        {t('karma.dashboard.frequency')}: {strength.frequency}x
                      </span>
                      <span>
                        {t('karma.dashboard.impact')}: +{strength.impact}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noPatterns}>{t('karma.dashboard.noStrengths')}</div>
              )}
            </div>

            <div className={styles.patternsColumn}>
              <h2 className={styles.patternsTitle}>{t('karma.dashboard.weaknesses')}</h2>
              {safePatterns.weaknesses && safePatterns.weaknesses.length > 0 ? (
                safePatterns.weaknesses.map((weakness, index) => (
                  <div key={index} className={`${styles.patternCard} ${styles.weaknessCard}`}>
                    <div className={styles.patternHeader}>
                      <span className={styles.patternIcon}>⚠️</span>
                      <h3 className={styles.patternLabel}>{weakness.label}</h3>
                    </div>
                    <p className={styles.patternDescription}>{weakness.description}</p>
                    <div className={styles.patternStats}>
                      <span>
                        {t('karma.dashboard.frequency')}: {weakness.frequency}x
                      </span>
                      <span>
                        {t('karma.dashboard.impact')}: {weakness.impact}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noPatterns}>{t('karma.dashboard.noWeaknesses')}</div>
              )}
            </div>
          </div>
        </div>

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

        <div className={styles.actionSection}>
          <button type="button" onClick={onAddKarma} className={styles.addKarmaBtn}>
            {t('karma.dashboard.addMoreKarma')}
          </button>
        </div>
      </div>
    </div>
  );
}
