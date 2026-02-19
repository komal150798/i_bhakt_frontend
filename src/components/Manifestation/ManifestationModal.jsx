import { useState, useEffect } from 'react';
import { manifestationApi } from '../../common/api/manifestationApi';
import styles from './ManifestationModal.module.css';

function ManifestationModal({ manifestation, initialDescription, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState({});
  const [isViewMode, setIsViewMode] = useState(false);
  const [resonanceResult, setResonanceResult] = useState(null);

  useEffect(() => {
    if (manifestation) {
      // View mode - show existing manifestation
      setIsViewMode(true);
      setFormData({
        description: manifestation.description || '',
      });
      setResonanceResult(null);
    } else {
      // Add mode - pre-fill with pending text from social media flow
      setIsViewMode(false);
      setFormData({
        description: initialDescription || '',
      });
      setResonanceResult(null);
      setErrors({});
    }
  }, [manifestation, initialDescription]);

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

    if (!formData.description || formData.description.trim().length < 15) {
      newErrors.description =
        'Description must be at least 15 characters long. Please provide more details about your manifestation intent.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!formData.description || formData.description.trim().length < 15) {
      setErrors({
        description: 'Description must be at least 15 characters long.',
      });
      return;
    }

    try {
      setCalculating(true);
      setErrors({});
      const result = await manifestationApi.calculateResonance(formData.description.trim());
      setResonanceResult(result);
    } catch (error) {
      console.error('Failed to calculate resonance:', error);
      setErrors({ description: error.message || 'Failed to calculate resonance score.' });
    } finally {
      setCalculating(false);
    }
  };

  const handleLock = async () => {
    if (!resonanceResult || !formData.description.trim()) {
      return;
    }

    try {
      setLoading(true);
      await manifestationApi.createManifestation({
        description: formData.description.trim(),
      });
      // Close modal and refresh dashboard
      onSuccess();
    } catch (error) {
      console.error('Failed to lock manifestation:', error);
      alert('Failed to lock manifestation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ description: '' });
    setResonanceResult(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewMode) {
      // Just close if viewing
      onClose();
      return;
    }

    // If no result yet, calculate first
    if (!resonanceResult) {
      await handleCalculate();
      return;
    }

    // If result exists, lock it
    await handleLock();
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
            {/* Title and Description Section */}
            <div className={styles.insightSection} style={{ marginBottom: 24 }}>
              <h2 style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                color: '#fbbf24', 
                marginBottom: 12,
                textTransform: 'none',
                letterSpacing: 'normal'
              }}>
                {manifestation.title}
              </h2>
              
              {manifestation.description && (
                <div style={{
                  padding: '16px',
                  background: 'rgba(251, 191, 36, 0.05)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: 8,
                  marginTop: 12
                }}>
                  <div style={{ 
                    fontSize: 12, 
                    color: '#94a3b8', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 8,
                    fontWeight: 600
                  }}>
                    Your Intention
                  </div>
                  <p style={{ 
                    fontSize: 15, 
                    color: '#e2e8f0', 
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}>
                    {manifestation.description}
                  </p>
                </div>
              )}

              {manifestation.category && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  padding: '10px 16px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 8,
                  marginTop: 12,
                  width: 'fit-content'
                }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Category:</span>
                  <span style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: '#fbbf24',
                    textTransform: 'capitalize'
                  }}>
                    {manifestation.category_label || manifestation.category}
                  </span>
                </div>
              )}

              {manifestation.added_date && (
                <div style={{ 
                  fontSize: 12, 
                  color: '#64748b', 
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>Created:</span>
                  <span style={{ color: '#94a3b8' }}>
                    {new Date(manifestation.added_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>

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
                
                {/* Main AI Narrative/Insights */}
                {manifestation.insights.ai_narrative && (
                  <div className={styles.narrative} style={{
                    padding: '16px',
                    background: 'rgba(251, 191, 36, 0.05)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    borderRadius: 8,
                    marginBottom: 16
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: 15, 
                      color: '#e2e8f0', 
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}>
                      {manifestation.insights.ai_narrative}
                    </p>
                  </div>
                )}

                {/* Astrological Insights */}
                {manifestation.insights.astro_insights && (
                  <div className={styles.astroInsights} style={{
                    padding: '16px',
                    background: 'rgba(100, 116, 139, 0.1)',
                    border: '1px solid rgba(100, 116, 139, 0.2)',
                    borderRadius: 8,
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#94a3b8', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 8,
                      fontWeight: 600
                    }}>
                      Astrological Alignment
                    </div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: 14, 
                      color: '#cbd5e1', 
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}>
                      {manifestation.insights.astro_insights}
                    </p>
                  </div>
                )}

                {/* Energy State with Detailed Reason */}
                <div style={{
                  padding: '16px',
                  background: manifestation.insights.energy_state === 'aligned'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : manifestation.insights.energy_state === 'unstable' || manifestation.insights.energy_state === 'scattered'
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${
                    manifestation.insights.energy_state === 'aligned'
                      ? 'rgba(16, 185, 129, 0.3)'
                      : manifestation.insights.energy_state === 'unstable' || manifestation.insights.energy_state === 'scattered'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                  }`,
                  borderRadius: 8,
                  marginTop: 16
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    marginBottom: manifestation.insights.energy_reason ? 12 : 0
                  }}>
                    <strong style={{ 
                      fontSize: 13, 
                      color: '#94a3b8', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Energy State:
                    </strong>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color:
                          manifestation.insights.energy_state === 'aligned'
                            ? '#10b981'
                            : manifestation.insights.energy_state === 'unstable' || manifestation.insights.energy_state === 'scattered'
                              ? '#f59e0b'
                              : '#ef4444',
                        textTransform: 'capitalize'
                      }}
                    >
                      {manifestation.insights.energy_state || 'unknown'}
                    </span>
                  </div>
                  {manifestation.insights.energy_reason && (
                    <div style={{ 
                      marginTop: 12, 
                      paddingTop: 12,
                      borderTop: `1px solid ${
                        manifestation.insights.energy_state === 'aligned'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : manifestation.insights.energy_state === 'unstable' || manifestation.insights.energy_state === 'scattered'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)'
                      }`,
                      fontSize: 14,
                      color: '#cbd5e1',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}>
                      {manifestation.insights.energy_reason}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Add Mode - Form with Calculate and Lock flow
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <h2 style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                color: '#fbbf24', 
                marginBottom: 20,
                textAlign: 'center'
              }}>
                Describe Your Manifestation
              </h2>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="I have become CM of Maharashtra in 2029"
                rows={6}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
              {formData.description.length > 0 && formData.description.length < 15 && (
                <div style={{ 
                  marginTop: 8, 
                  fontSize: 12, 
                  color: '#94a3b8' 
                }}>
                  {formData.description.length}/15 minimum
                </div>
              )}
              {errors.description && (
                <span className={styles.error}>{errors.description}</span>
              )}
            </div>

            {!resonanceResult ? (
              // Show Calculate button
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleCalculate} 
                  className={styles.submitButton} 
                  disabled={calculating || formData.description.trim().length < 15}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    width: '100%',
                    maxWidth: '400px'
                  }}
                >
                  {calculating ? 'Calculating...' : 'Calculate Resonance Score & Generate Reading'}
                </button>
              </div>
            ) : (
              // Show Results and Lock button
              <>
                <div style={{
                  marginTop: 24,
                  padding: '20px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  marginBottom: 20
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 16
                  }}>
                    <h3 style={{ 
                      fontSize: 20, 
                      fontWeight: 700, 
                      color: '#fbbf24',
                      margin: 0
                    }}>
                      Manifestation Resonance Score
                    </h3>
                    <button 
                      onClick={handleClear}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: '6px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Clear & Enter New
                    </button>
                  </div>

                  {/* Resonance Score Display */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: 20
                  }}>
                    <div style={{
                      fontSize: 48,
                      fontWeight: 700,
                      color: '#fbbf24',
                      marginBottom: 8
                    }}>
                      {resonanceResult.resonance_score || 0}%
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Your Manifestation Resonance
                    </div>
                  </div>

                  {/* Category */}
                  {resonanceResult.category_label && (
                    <div style={{
                      marginTop: 16,
                      padding: '12px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ 
                        fontSize: 11, 
                        color: '#94a3b8', 
                        textTransform: 'uppercase',
                        marginBottom: 4
                      }}>
                        Category
                      </div>
                      <div style={{ 
                        fontSize: 16, 
                        color: '#fbbf24',
                        fontWeight: 600
                      }}>
                        {resonanceResult.category_label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lock Manifestation Section */}
                <div style={{
                  padding: '20px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: 20, 
                      fontWeight: 700, 
                      color: '#fbbf24',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      🔒 Lock Your Manifestation
                    </div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: 14, 
                      color: '#cbd5e1',
                      lineHeight: 1.6
                    }}>
                      Lock this manifestation to add actionable tips to your Daily Alignment Tips.
                      These tips will help you align with your Dasha periods and improve your karma.
                    </p>
                  </div>
                  <button 
                    onClick={handleLock}
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(249, 115, 22, 0.85))',
                      color: '#0f172a',
                      border: '2px solid rgba(251, 191, 36, 0.8)',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Locking...' : '🔒 Lock Manifestation'}
                  </button>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className={styles.cancelButton}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManifestationModal;


