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

  return (
    <div className={styles.dashboard}>
      {/* Summary Header */}
      <div className={styles.summaryHeader}>
        <h2>Manifestation</h2>
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

      {/* Manifestations List */}
      <div className={styles.manifestationsSection}>
        <div className={styles.sectionHeader}>
          <h3>Manifestation</h3>
          <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>Intentions List</div>
        </div>

        {manifestations.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No active manifestations yet.</p>
            <button className={styles.addButton} onClick={handleAddManifestation}>
              Create Your First Manifestation
            </button>
          </div>
        ) : (
          <div className={styles.manifestationsList}>
            {manifestations.map((manifestation) => (
              <div 
                key={manifestation.id} 
                className={styles.manifestationCard}
                onClick={() => handleViewInsights(manifestation.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h4>{manifestation.title}</h4>
                    {manifestation.category && (
                      <span style={{ 
                        fontSize: 12, 
                        color: '#fbbf24', 
                        textTransform: 'capitalize',
                        marginTop: 4,
                        display: 'block'
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


