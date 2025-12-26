import { useState, useEffect } from 'react';
import { manifestationApi } from '../../common/api/manifestationApi';
import ManifestationModal from './ManifestationModal';
import styles from './ManifestationDashboard.module.css';

function ManifestationDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedManifestation, setSelectedManifestation] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await manifestationApi.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      // Don't show alert for auth errors (they redirect to login)
      if (!error.message.includes('Authentication') && !error.message.includes('Session expired')) {
        alert('Failed to load manifestation dashboard: ' + error.message);
      }
      // Set empty dashboard state on error
      setDashboard({
        summary: {
          top_resonance: 0,
          alignment_score: 0,
          astro_support: 0,
          energy_state: 'unknown',
        },
        manifestations: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddManifestation = () => {
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
      await manifestationApi.toggleLockManifestation(manifestationId);
      const message = currentLockStatus
        ? 'Manifestation unlocked. It will no longer be included in dashboard calculations.'
        : 'Manifestation locked. It will now be included in dashboard calculations.';
      alert(message);
      fetchDashboard();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      alert('Failed to toggle lock: ' + error.message);
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
          <h1 className={styles.pageTitle}>Manifestation Dashboard</h1>
          <p className={styles.pageSubtitle}>Track your locked manifestations and their resonance scores</p>
        </div>
        <button className={styles.createButton} onClick={handleAddManifestation}>
          <span className={styles.createButtonIcon}>+</span>
          Create New Manifestation
        </button>
      </div>

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
                onClick={() => handleViewInsights(manifestation.id)}
                style={{ cursor: 'pointer' }}
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
                  <span className={styles.arrowIcon}>→</span>
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
                      handleViewInsights(manifestation.id);
                    }}
                  >
                    View Insights
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
          onClose={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
}

export default ManifestationDashboard;


