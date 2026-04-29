import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { manifestationApi } from '../../common/api/manifestationApi';
import ManifestationModal from './ManifestationModal';
import styles from './ManifestationDashboard.module.css';

const PENDING_KEY = 'ibhakt_pending_manifestation';

function ManifestationDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedManifestation, setSelectedManifestation] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'
  const [pendingDescription, setPendingDescription] = useState('');
  const [expandedManifestationId, setExpandedManifestationId] = useState(null);
  const [manifestationDetailsMap, setManifestationDetailsMap] = useState({});
  const [detailsLoadingMap, setDetailsLoadingMap] = useState({});
  const [subEntryDateMap, setSubEntryDateMap] = useState({});
  const [subEntryTextMap, setSubEntryTextMap] = useState({});
  const [subEntrySubmittingMap, setSubEntrySubmittingMap] = useState({});

  const getPlanLabel = (planType) => {
    if (planType === 'awaken') return 'Awaken (Free)';
    if (planType === 'karma_builder') return 'Karma Builder';
    if (planType === 'karma_pro') return 'Karma Pro';
    if (planType === 'dharma_master') return 'Dharma Master';
    return planType || 'Unknown';
  };

  useEffect(() => {
    console.log('[ManifestationDashboard] Component mounted - fetching dashboard');
    fetchDashboard();

    // Check for pending manifestation from Instagram/social flow
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      setPendingDescription(pending);
      localStorage.removeItem(PENDING_KEY);
      // Auto-open modal with the pending text
      setSelectedManifestation(null);
      setShowModal(true);
    }
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await manifestationApi.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      // Don't show alert for auth errors (they redirect to login via ProtectedRoute)
      if (!error.message.includes('Authentication') && !error.message.includes('Session expired')) {
        alert('Failed to load manifestation dashboard: ' + error.message);
      }
      // Set empty dashboard state on error to prevent redirect
      setDashboard({
        summary: {
          top_resonance: 0,
          alignment_score: 0,
          astro_support: 0,
          energy_state: 'unknown',
        },
        manifestations: [],
      });
      // Don't throw error - stay on page
    } finally {
      setLoading(false);
    }
  };

  const handleAddManifestation = () => {
    if (dashboard?.plan?.can_create_manifestation === false) {
      const monthlyLimit = dashboard?.plan?.monthly_limit;
      const used = dashboard?.plan?.monthly_used || 0;
      if (monthlyLimit !== null && monthlyLimit !== undefined) {
        alert(
          `Monthly manifestation limit reached (${used}/${monthlyLimit}) for your current plan. Please upgrade to continue.`,
        );
      } else {
        alert('Manifestation creation is not available in your current plan.');
      }
      return;
    }
    setSelectedManifestation(null);
    setShowModal(true);
  };

  const handleViewInsights = async (manifestationId) => {
    try {
      const data = await manifestationApi.getManifestationById(manifestationId);
      setSelectedManifestation(data);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch manifestation:', error);
      alert('Failed to load manifestation details: ' + error.message);
    }
  };

  const handleToggleAccordion = async (manifestationId) => {
    if (expandedManifestationId === manifestationId) {
      setExpandedManifestationId(null);
      return;
    }

    setExpandedManifestationId(manifestationId);

    if (manifestationDetailsMap[manifestationId]) {
      return;
    }

    try {
      setDetailsLoadingMap((prev) => ({ ...prev, [manifestationId]: true }));
      const data = await manifestationApi.getManifestationById(manifestationId);
      setManifestationDetailsMap((prev) => ({ ...prev, [manifestationId]: data }));
    } catch (error) {
      console.error('Failed to fetch manifestation details for accordion:', error);
      alert('Failed to load manifestation details: ' + error.message);
    } finally {
      setDetailsLoadingMap((prev) => ({ ...prev, [manifestationId]: false }));
    }
  };

  const handleAddSubManifestationEntry = async (manifestationId) => {
    const entryDate =
      subEntryDateMap[manifestationId] || new Date().toISOString().split('T')[0];
    const actionText = (subEntryTextMap[manifestationId] || '').trim();

    if (!entryDate || !actionText) {
      alert('Please select date and enter what you did today.');
      return;
    }

    try {
      setSubEntrySubmittingMap((prev) => ({ ...prev, [manifestationId]: true }));
      const created = await manifestationApi.addDailyProgressEntry(
        manifestationId,
        entryDate,
        actionText,
      );

      setManifestationDetailsMap((prev) => {
        const existing = prev[manifestationId] || {};
        const currentEntries = existing.daily_progress_entries || [];
        return {
          ...prev,
          [manifestationId]: {
            ...existing,
            daily_progress_entries: [
              {
                id: created.id,
                manifestation_id: created.manifestation_id,
                entry_date: created.entry_date,
                action_text: created.action_text,
                added_date: created.added_date || new Date().toISOString(),
              },
              ...currentEntries,
            ],
          },
        };
      });

      setSubEntryTextMap((prev) => ({ ...prev, [manifestationId]: '' }));
    } catch (error) {
      console.error('Failed to add sub manifestation entry:', error);
      alert(error.message || 'Failed to add sub manifestation entry.');
    } finally {
      setSubEntrySubmittingMap((prev) => ({ ...prev, [manifestationId]: false }));
    }
  };

  const handleArchive = async (manifestationId) => {
    if (!confirm('Are you sure you want to archive this manifestation?')) {
      return;
    }

    try {
      await manifestationApi.archiveManifestation(manifestationId);
      alert('Manifestation archived successfully!');
      fetchDashboard();
    } catch (error) {
      console.error('Failed to archive manifestation:', error);
      alert('Failed to archive manifestation: ' + error.message);
    }
  };

  const handleToggleLock = async (manifestationId, currentLockStatus) => {
    try {
      const response = await manifestationApi.toggleLockManifestation(manifestationId);
      const message = response?.message || (currentLockStatus
        ? 'Manifestation unlocked. It will no longer be included in dashboard calculations.'
        : 'Manifestation locked. It will now be included in dashboard calculations.');
      
      // Refresh dashboard without navigation
      await fetchDashboard();
      
      // Show success message (optional - can remove alert if you prefer)
      console.log('Lock toggled successfully:', message);
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      // Only show error if it's not an auth error (auth errors are handled by ProtectedRoute)
      if (!error.message.includes('Authentication') && !error.message.includes('Session expired')) {
        alert('Failed to toggle lock: ' + error.message);
      }
      // Don't navigate on error - stay on page
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedManifestation(null);
    fetchDashboard(); // Refresh dashboard after modal closes
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading manifestation dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className={styles.error}>
        <p>Failed to load dashboard. Please try again.</p>
      </div>
    );
  }

  const { summary, manifestations } = dashboard;
  const planInfo = dashboard?.plan;
  const hasReachedLimit = planInfo?.can_create_manifestation === false;

  const openUpgradeFlow = () => {
    if (location.pathname === '/dashboard') {
      window.dispatchEvent(new Event('ibhakt:open-plan-modal'));
      return;
    }
    navigate('/dashboard?openPlanModal=1', {
      state: { openPlanModal: true, from: 'manifestation_limit' },
    });
  };

  // Separate locked and unlocked manifestations
  const lockedManifestations = manifestations.filter(m => m.is_locked === true);
  const unlockedManifestations = manifestations.filter(m => m.is_locked !== true);

  // Get energy state color
  const getEnergyStateColor = (state) => {
    switch (state) {
      case 'aligned':
        return '#10b981'; // green
      case 'unstable':
        return '#f59e0b'; // yellow
      case 'blocked':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className={styles.dashboard}>
      {/* Header with Create Button */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={`page-hero-heading page-hero-heading--compact ${styles.pageTitle}`}>
            Manifestation Dashboard
          </h1>
          <p className={styles.pageSubtitle}>Track your locked manifestations and their resonance scores</p>
          {planInfo && (
            <div className={styles.planInfo}>
              <span className={styles.planPill}>
                Plan: {getPlanLabel(planInfo.plan_type)}
              </span>
              <span className={styles.usagePill}>
                Monthly Usage:{' '}
                {planInfo.monthly_limit === null
                  ? `${planInfo.monthly_used} / Unlimited`
                  : `${planInfo.monthly_used} / ${planInfo.monthly_limit}`}
              </span>
            </div>
          )}
        </div>
        <button
          className={styles.createButton}
          onClick={hasReachedLimit ? openUpgradeFlow : handleAddManifestation}
          title={
            hasReachedLimit
              ? 'Upgrade plan to continue creating manifestations'
              : 'Create new manifestation'
          }
        >
          <span className={styles.createButtonIcon}>+</span>
          {hasReachedLimit ? 'Upgrade Plan' : 'Create New Manifestation'}
        </button>
      </div>

      {hasReachedLimit && (
        <div className={styles.upgradeCard}>
          <div className={styles.upgradeCardLeft}>
            <div className={styles.upgradeBadge}>
              <i className="bi bi-star-fill" aria-hidden />
              Premium
            </div>
            <h3 className={styles.upgradeTitle}>You have reached your free plan limit</h3>
            <p className={styles.upgradeSubtitle}>
              Upgrade now to unlock unlimited manifestations and deeper daily guidance.
            </p>
            <div className={styles.upgradeFeatures}>
              <span>Unlimited manifestation analysis</span>
              <span>Advanced insights and guidance</span>
              <span>Priority spiritual-tech support</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.upgradeCta}
            onClick={openUpgradeFlow}
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Summary Cards - Only show if there are locked manifestations */}
      {lockedManifestations.length > 0 && (
        <div className={styles.summaryHeader}>
          <h2>Overall Summary</h2>
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Resonance Score</div>
              <div className={styles.summaryValue}>{summary.top_resonance || 0}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Alignment Score</div>
              <div className={styles.summaryValue}>{summary.alignment_score || 0}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Astro Support</div>
              <div className={styles.summaryValue}>{summary.astro_support || 0}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Energy State</div>
              <div
                className={styles.energyBadge}
                style={{ backgroundColor: getEnergyStateColor(summary.energy_state) }}
              >
                {summary.energy_state || 'unknown'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Locked Manifestations - Score Cards */}
      {lockedManifestations.length > 0 && (
        <div className={styles.manifestationsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Locked Manifestations</h3>
              <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', marginTop: 4 }}>
                {lockedManifestations.length} active {lockedManifestations.length === 1 ? 'manifestation' : 'manifestations'}
              </div>
            </div>
          </div>
          <div className={styles.scoreCardsGrid}>
            {lockedManifestations.map((manifestation, index) => (
              <div 
                key={manifestation.id} 
                className={styles.scoreCard}
                onClick={() => handleViewInsights(manifestation.id)}
              >
                <div className={styles.scoreCardHeader}>
                  <div className={styles.scoreCardNumber}>#{index + 1}</div>
                  <div className={styles.scoreCardTitle}>{manifestation.title}</div>
                </div>
                {manifestation.category && (
                  <div className={styles.scoreCardCategory}>
                    {manifestation.category_label || manifestation.category}
                  </div>
                )}
                <div className={styles.scoreCardScores}>
                  <div className={styles.scoreItem}>
                    <span className={styles.scoreLabel}>Resonance</span>
                    <span 
                      className={styles.scoreValue}
                      style={{ color: getScoreColor(manifestation.resonance_score || 0) }}
                    >
                      {manifestation.resonance_score || 0}
                    </span>
                  </div>
                  <div className={styles.scoreItem}>
                    <span className={styles.scoreLabel}>Alignment</span>
                    <span 
                      className={styles.scoreValue}
                      style={{ color: getScoreColor(manifestation.alignment_score || 0) }}
                    >
                      {manifestation.alignment_score || 0}
                    </span>
                  </div>
                  <div className={styles.scoreItem}>
                    <span className={styles.scoreLabel}>MFP Score</span>
                    <span 
                      className={styles.scoreValue}
                      style={{ color: getScoreColor(manifestation.mfp_score || 0) }}
                    >
                      {manifestation.mfp_score || 0}
                    </span>
                  </div>
                  {manifestation.coherence_score !== null && (
                    <div className={styles.scoreItem}>
                      <span className={styles.scoreLabel}>Coherence</span>
                      <span 
                        className={styles.scoreValue}
                        style={{ color: getScoreColor(manifestation.coherence_score || 0) }}
                      >
                        {manifestation.coherence_score || 0}
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.scoreCardActions}>
                  <button
                    className={styles.viewButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewInsights(manifestation.id);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className={styles.unlockButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLock(manifestation.id, manifestation.is_locked);
                    }}
                    title="Unlock to exclude from dashboard"
                  >
                    🔓 Unlock
                  </button>
                </div>
                <div className={styles.scoreCardDate}>
                  Created: {new Date(manifestation.added_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlocked Manifestations - Regular List */}
      {unlockedManifestations.length > 0 && (
        <div className={styles.manifestationsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>Unlocked Manifestations</h3>
              <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', marginTop: 4 }}>
                {unlockedManifestations.length} unlocked {unlockedManifestations.length === 1 ? 'manifestation' : 'manifestations'}
              </div>
            </div>
          </div>

          {unlockedManifestations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No unlocked manifestations.</p>
            </div>
          ) : (
            <div className={styles.manifestationsList}>
              {/* Sort manifestations by creation date (oldest first) */}
              {[...unlockedManifestations].sort((a, b) => {
                const dateA = new Date(a.added_date || 0).getTime();
                const dateB = new Date(b.added_date || 0).getTime();
                return dateA - dateB; // Oldest first
              }).map((manifestation, index) => (
              <div
                key={manifestation.id} 
                className={styles.manifestationCard}
              >
                <div className={styles.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ 
                        fontSize: 11, 
                        color: '#64748b',
                        fontWeight: 600,
                        background: 'rgba(100, 116, 139, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 4
                      }}>
                        #{index + 1}
                      </span>
                      <h4 style={{ margin: 0, flex: 1 }}>{manifestation.title}</h4>
                    </div>
                    {manifestation.category && (
                      <span style={{ 
                        fontSize: 12, 
                        color: '#fbbf24', 
                        textTransform: 'capitalize',
                        display: 'inline-block',
                        background: 'rgba(251, 191, 36, 0.1)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        marginTop: 4
                      }}>
                        {manifestation.category_label || manifestation.category}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.accordionToggle}
                    onClick={() => handleToggleAccordion(manifestation.id)}
                    aria-expanded={expandedManifestationId === manifestation.id}
                    aria-label={expandedManifestationId === manifestation.id ? 'Collapse details' : 'Expand details'}
                  >
                    <i
                      className={`bi ${expandedManifestationId === manifestation.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                      aria-hidden
                    />
                  </button>
                </div>
                <div className={styles.cardMetrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Resonance:</span>
                    <span className={styles.metricValue}>
                      {manifestation.resonance_score || 0}
                    </span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>MFP Score:</span>
                    <span className={styles.metricValue}>
                      {manifestation.mfp_score || 0}
                    </span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Created:</span>
                    <span className={styles.metricValue}>
                      {new Date(manifestation.added_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.viewButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAccordion(manifestation.id);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className={manifestation.is_locked ? styles.lockButtonActive : styles.lockButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLock(manifestation.id, manifestation.is_locked);
                    }}
                    title={manifestation.is_locked ? 'Unlock to exclude from dashboard' : 'Lock to include in dashboard'}
                  >
                    {manifestation.is_locked ? '🔒 Locked' : '🔓 Unlocked'}
                  </button>
                  <button
                    className={styles.archiveButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(manifestation.id);
                    }}
                  >
                    Archive
                  </button>
                </div>

                {expandedManifestationId === manifestation.id && (
                  <div className={styles.accordionContent}>
                    {detailsLoadingMap[manifestation.id] ? (
                      <p className={styles.accordionLoading}>Loading full manifestation details...</p>
                    ) : (
                      <>
                        <div className={styles.accordionSection}>
                          <h5>Manifestation Details</h5>
                          <p className={styles.accordionDescription}>
                            {manifestationDetailsMap[manifestation.id]?.description || manifestation.description || 'No description available.'}
                          </p>
                        </div>

                        <div className={styles.accordionSection}>
                          <h5>Scores</h5>
                          <div className={styles.accordionMetrics}>
                            <div><span>Resonance</span><strong>{manifestationDetailsMap[manifestation.id]?.resonance_score ?? manifestation.resonance_score ?? 0}</strong></div>
                            <div><span>Alignment</span><strong>{manifestationDetailsMap[manifestation.id]?.alignment_score ?? manifestation.alignment_score ?? 0}</strong></div>
                            <div><span>MFP</span><strong>{manifestationDetailsMap[manifestation.id]?.mfp_score ?? manifestation.mfp_score ?? 0}</strong></div>
                            <div><span>Astro Support</span><strong>{manifestationDetailsMap[manifestation.id]?.astro_support_index ?? manifestation.astro_support_index ?? 0}</strong></div>
                          </div>
                        </div>

                        <div className={styles.accordionSection}>
                          <h5>Sub Manifestation (Daily Entries)</h5>
                          <div className={styles.addSubEntryBox}>
                            <input
                              type="date"
                              value={subEntryDateMap[manifestation.id] || new Date().toISOString().split('T')[0]}
                              onChange={(e) =>
                                setSubEntryDateMap((prev) => ({
                                  ...prev,
                                  [manifestation.id]: e.target.value,
                                }))
                              }
                              className={styles.subEntryDateInput}
                            />
                            <textarea
                              value={subEntryTextMap[manifestation.id] || ''}
                              onChange={(e) =>
                                setSubEntryTextMap((prev) => ({
                                  ...prev,
                                  [manifestation.id]: e.target.value,
                                }))
                              }
                              placeholder="What did you do today for this manifestation?"
                              rows={2}
                              className={styles.subEntryTextInput}
                            />
                            <button
                              type="button"
                              className={styles.addSubEntryButton}
                              disabled={subEntrySubmittingMap[manifestation.id]}
                              onClick={() => handleAddSubManifestationEntry(manifestation.id)}
                            >
                              {subEntrySubmittingMap[manifestation.id] ? 'Adding...' : 'Add Entry'}
                            </button>
                          </div>

                          {(manifestationDetailsMap[manifestation.id]?.daily_progress_entries || []).length === 0 ? (
                            <p className={styles.accordionEmpty}>No sub manifestation entries yet.</p>
                          ) : (
                            <div className={styles.subManifestationList}>
                              {manifestationDetailsMap[manifestation.id].daily_progress_entries.map((entry) => (
                                <div key={entry.id} className={styles.subManifestationItem}>
                                  <div className={styles.subManifestationDate}>
                                    {new Date(entry.entry_date).toLocaleDateString()}
                                  </div>
                                  <div className={styles.subManifestationText}>{entry.action_text}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State - No manifestations at all */}
      {manifestations.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>✨</div>
          <h3>No Manifestations Yet</h3>
          <p>Start your manifestation journey by creating your first intention.</p>
          <button className={styles.addButton} onClick={handleAddManifestation}>
            Create Your First Manifestation
          </button>
        </div>
      )}

      {/* Floating Add Button */}
      <button className={styles.floatingAddButton} onClick={handleAddManifestation}>
        +
      </button>

      {/* Modal */}
      {showModal && (
        <ManifestationModal
          manifestation={selectedManifestation}
          initialDescription={pendingDescription}
          onClose={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
}

export default ManifestationDashboard;


