import { useState, useEffect } from 'react';
import { manifestationApi } from '../../common/api/manifestationApi';
import styles from './ManifestationModal.module.css';

function ManifestationModal({ manifestation, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    if (manifestation) {
      // View mode - show existing manifestation
      setIsViewMode(true);
      setFormData({
        title: manifestation.title || '',
        description: manifestation.description || '',
      });
    } else {
      // Add mode
      setIsViewMode(false);
      setFormData({
        title: '',
        description: '',
      });
    }
    setErrors({});
  }, [manifestation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description || formData.description.trim().length < 15) {
      newErrors.description =
        'Description must be at least 15 characters long. Please provide more details about your manifestation intent.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewMode) {
      // Just close if viewing
      onClose();
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await manifestationApi.createManifestation({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      alert('Manifestation added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create manifestation:', error);
      alert('Failed to create manifestation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
            <h2>{isViewMode ? 'Manifestation Insights' : 'New Manifestation'}</h2>
          </div>
          <span 
            onClick={onClose}
            style={{ 
              fontSize: 14, 
              color: '#94a3b8', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Close
          </span>
        </div>

        {isViewMode && manifestation ? (
          // View Mode - Show Insights
          <div className={styles.insightsView}>
            {/* Category Display */}
            {manifestation.category && (
              <div className={styles.insightSection} style={{ marginBottom: 16 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 8
                }}>
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>Category:</span>
                  <span style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: '#fbbf24',
                    textTransform: 'capitalize'
                  }}>
                    {manifestation.category_label || manifestation.category}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.insightSection}>
              <h3>Scores</h3>
              <div className={styles.scoresGrid}>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreLabel}>Resonance Score</div>
                  <div className={styles.scoreValue}>
                    {manifestation.resonance_score || 0}
                  </div>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreLabel}>Alignment Score</div>
                  <div className={styles.scoreValue}>
                    {manifestation.alignment_score || 0}
                  </div>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreLabel}>Antrashaakti (Inner Power)</div>
                  <div className={styles.scoreValue}>
                    {manifestation.antrashaakti_score || 0}
                  </div>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreLabel}>Mahaadha (Blockage)</div>
                  <div className={styles.scoreValue}>
                    {manifestation.mahaadha_score || 0}
                  </div>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreLabel}>Astro Support Index</div>
                  <div className={styles.scoreValue}>
                    {manifestation.astro_support_index || 0}
                  </div>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreLabel}>MFP Score</div>
                  <div className={styles.scoreValue}>{manifestation.mfp_score || 0}</div>
                </div>
              </div>
            </div>

            {manifestation.tips && (
              <div className={styles.insightSection}>
                <h3>Guidance</h3>
                {manifestation.tips.rituals && manifestation.tips.rituals.length > 0 && (
                  <div className={styles.tipGroup}>
                    <h4>Suggested Rituals</h4>
                    <ul>
                      {manifestation.tips.rituals.map((ritual, idx) => (
                        <li key={idx}>{ritual}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {manifestation.tips.what_to_manifest &&
                  manifestation.tips.what_to_manifest.length > 0 && (
                    <div className={styles.tipGroup}>
                      <h4>What To Manifest</h4>
                      <ul>
                        {manifestation.tips.what_to_manifest.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {manifestation.tips.what_not_to_manifest &&
                  manifestation.tips.what_not_to_manifest.length > 0 && (
                    <div className={styles.tipGroup}>
                      <h4>What NOT To Manifest</h4>
                      <ul>
                        {manifestation.tips.what_not_to_manifest.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {manifestation.tips.thought_alignment &&
                  manifestation.tips.thought_alignment.length > 0 && (
                    <div className={styles.tipGroup}>
                      <h4>Thought Alignment Tips</h4>
                      <ul>
                        {manifestation.tips.thought_alignment.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {manifestation.insights && (
              <div className={styles.insightSection}>
                <h3>Insights</h3>
                {manifestation.insights.ai_narrative && (
                  <div className={styles.narrative}>
                    <p>{manifestation.insights.ai_narrative}</p>
                  </div>
                )}
                {manifestation.insights.astro_insights && (
                  <div className={styles.astroInsights}>
                    <p>{manifestation.insights.astro_insights}</p>
                  </div>
                )}
                <div className={styles.energyState}>
                  <strong>Energy State:</strong>{' '}
                  <span
                    style={{
                      color:
                        manifestation.insights.energy_state === 'aligned'
                          ? '#10b981'
                          : manifestation.insights.energy_state === 'unstable'
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  >
                    {manifestation.insights.energy_state || 'unknown'}
                  </span>
                </div>
                {manifestation.insights.energy_reason && (
                  <div style={{ 
                    marginTop: 12, 
                    padding: 12, 
                    background: 'rgba(148, 163, 184, 0.1)', 
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#cbd5e1',
                    lineHeight: 1.6
                  }}>
                    <strong style={{ color: '#fbbf24' }}>Why:</strong> {manifestation.insights.energy_reason}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Add Mode - Form
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title">
                Title <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., I want a new job"
                required
              />
              {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">
                Description / Intent <span className={styles.required}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details and feelings"
                rows={5}
                required
              />
              <small className={styles.helpText}>
                Minimum 15 characters. Be specific about your intention.
              </small>
              {errors.description && (
                <span className={styles.error}>{errors.description}</span>
              )}
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Creating...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ManifestationModal;


