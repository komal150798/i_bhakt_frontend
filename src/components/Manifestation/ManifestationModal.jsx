import { useState, useEffect, useMemo } from 'react';
import { manifestationApi } from '../../common/api/manifestationApi';
import { useToast } from '../../common/hooks/useToast';
import styles from './ManifestationModal.module.css';

/**
 * Gate premium manifestation copy on dashboard `plan.plan_type` (e.g. karma_pro).
 * Free tier: awaken (or legacy "free" string only).
 */
function canSeeFullManifestationGuidance(planType) {
  if (planType == null) return false;
  const s = String(planType).toLowerCase().trim();
  if (!s) return false;
  return s !== 'awaken' && s !== 'free';
}

/** DB / transport sometimes returns JSON columns as strings */
function parseJsonRecord(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      const p = JSON.parse(value);
      return p !== null && typeof p === 'object' ? p : null;
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') return value;
  return null;
}

function coerceArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeTipsForUi(raw) {
  const tips = parseJsonRecord(raw);
  if (!tips || typeof tips !== 'object') return null;
  return {
    karmic_theme: tips.karmic_theme ?? tips.karmicTheme,
    daily_actions: coerceArray(tips.daily_actions ?? tips.dailyActions),
    rituals: coerceArray(tips.rituals),
    what_to_manifest: coerceArray(tips.what_to_manifest ?? tips.whatToManifest),
    what_not_to_manifest: coerceArray(tips.what_not_to_manifest ?? tips.whatNotToManifest),
    thought_alignment: coerceArray(tips.thought_alignment ?? tips.thoughtAlignment),
  };
}

function tipsHasContent(t) {
  if (!t) return false;
  if (typeof t.karmic_theme === 'string' && t.karmic_theme.trim()) return true;
  return ['daily_actions', 'rituals', 'what_to_manifest', 'what_not_to_manifest', 'thought_alignment'].some(
    (k) => t[k]?.length > 0,
  );
}

function normalizeInsightsForUi(raw) {
  const ins = parseJsonRecord(raw);
  if (!ins || typeof ins !== 'object') return null;
  let keyword_analysis = ins.keyword_analysis;
  if (typeof keyword_analysis === 'string') {
    try {
      keyword_analysis = JSON.parse(keyword_analysis);
    } catch {
      keyword_analysis = null;
    }
  }
  if (keyword_analysis !== null && typeof keyword_analysis !== 'object') keyword_analysis = null;
  return { ...ins, keyword_analysis };
}

function actionWindowsHasContent(aw) {
  if (!aw || typeof aw !== 'object') return false;
  if (Array.isArray(aw.optimal_dates) && aw.optimal_dates.length > 0) return true;
  if (aw.next_optimal_date) return true;
  if (Array.isArray(aw.planetary_influences) && aw.planetary_influences.length > 0) return true;
  return false;
}

function progressTrackingHasContent(p) {
  if (!p || typeof p !== 'object') return false;
  if (typeof p.current_progress === 'number' && !Number.isNaN(p.current_progress)) return true;
  if (Array.isArray(p.milestones) && p.milestones.length > 0) return true;
  if (Array.isArray(p.alignment_actions) && p.alignment_actions.length > 0) return true;
  if (p.commitment_message || p.is_committed) return true;
  return false;
}

function ManifestationModal({
  manifestation,
  initialDescription,
  onClose,
  onSuccess,
  /** From GET /app/manifestation/dashboard → `plan` (use plan.plan_type) */
  plan,
  /** While dashboard is fetching, avoid showing the free-plan upsell to paying users */
  dashboardLoading = false,
}) {
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState({
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState({});
  const [isViewMode, setIsViewMode] = useState(false);
  const [resonanceResult, setResonanceResult] = useState(null);
  const [dailyEntryDate, setDailyEntryDate] = useState('');
  const [dailyActionText, setDailyActionText] = useState('');
  const [dailySubmitting, setDailySubmitting] = useState(false);
  const [dailyEntries, setDailyEntries] = useState([]);

  useEffect(() => {
    if (manifestation) {
      // View mode - show existing manifestation
      setIsViewMode(true);
      setFormData({
        description: manifestation.description || '',
      });
      setDailyEntries(manifestation.daily_progress_entries || []);
      setDailyEntryDate(new Date().toISOString().split('T')[0]);
      setDailyActionText('');
      setResonanceResult(null);
    } else {
      // Add mode - pre-fill with pending text from social media flow
      setIsViewMode(false);
      setFormData({
        description: initialDescription || '',
      });
      setDailyEntries([]);
      setResonanceResult(null);
      setErrors({});
    }
  }, [manifestation, initialDescription]);

  const planTypeRaw =
    plan?.plan_type ?? plan?.planType ?? manifestation?.plan_type ?? manifestation?.planType;
  const showPremiumGuidance = canSeeFullManifestationGuidance(planTypeRaw);

  const tipsModel = useMemo(() => normalizeTipsForUi(manifestation?.tips), [manifestation?.tips]);
  const insightsModel = useMemo(
    () => normalizeInsightsForUi(manifestation?.insights),
    [manifestation?.insights],
  );
  const actionWindowsModel = useMemo(
    () => parseJsonRecord(manifestation?.action_windows),
    [manifestation?.action_windows],
  );
  const progressTrackingModel = useMemo(
    () => parseJsonRecord(manifestation?.progress_tracking),
    [manifestation?.progress_tracking],
  );
  const summaryForUi =
    manifestation?.summary_for_ui || insightsModel?.summary_for_ui || null;

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
      // Clear form and close modal
      setFormData({ description: '' });
      setResonanceResult(null);
      setErrors({});
      showSuccess('Manifestation saved', {
        description: 'Your intention is locked and ready to track.',
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to lock manifestation:', error);
      showError('Could not save manifestation', { description: error.message });
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

  const dailyProgressEntries = dailyEntries;

  const handleAddDailyProgress = async () => {
    if (!manifestation?.id) return;
    if (!dailyEntryDate || !dailyActionText.trim()) {
      showWarning('Missing information', {
        description: 'Please select a date and describe what you did today.',
      });
      return;
    }

    try {
      setDailySubmitting(true);
      const newEntry = await manifestationApi.addDailyProgressEntry(
        manifestation.id,
        dailyEntryDate,
        dailyActionText.trim(),
      );
      setDailyActionText('');
      setDailyEntries((prev) => [
        {
          id: newEntry.id,
          manifestation_id: newEntry.manifestation_id,
          entry_date: newEntry.entry_date,
          action_text: newEntry.action_text,
          added_date: new Date().toISOString(),
        },
        ...prev,
      ]);
      showSuccess('Daily entry saved', { description: 'Your progress has been recorded.' });
    } catch (error) {
      console.error('Failed to add daily progress entry:', error);
      showError('Could not save entry', {
        description: error.message || 'Failed to add daily progress entry.',
      });
    } finally {
      setDailySubmitting(false);
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
            {/* Title and Description Section */}
            <div className={styles.insightSection} style={{ marginBottom: 24 }}>
              <h2 style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                color: 'var(--primary-color)', 
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
                    color: 'var(--primary-color)',
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
              <h3>Daily Sub Manifestation (What you did)</h3>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <input
                    type="date"
                    value={dailyEntryDate}
                    onChange={(e) => setDailyEntryDate(e.target.value)}
                    style={{
                      width: '220px',
                      padding: '8px 10px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <textarea
                    value={dailyActionText}
                    onChange={(e) => setDailyActionText(e.target.value)}
                    placeholder="Aaj manifestation complete karne ke liye maine kya kiya..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDailyProgress}
                    disabled={dailySubmitting}
                    style={{
                      width: 'fit-content',
                      padding: '8px 14px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: dailySubmitting ? 'not-allowed' : 'pointer',
                      opacity: dailySubmitting ? 0.7 : 1,
                    }}
                  >
                    {dailySubmitting ? 'Adding...' : 'Add Daily Entry'}
                  </button>
                </div>
              </div>
              {dailyProgressEntries.length === 0 ? (
                <p style={{ color: '#94a3b8', marginTop: 0 }}>
                  No daily entries yet.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {dailyProgressEntries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.5 }}>
                        {entry.action_text}
                      </div>
                    </div>
                  ))}
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

            {showPremiumGuidance && summaryForUi && (
              <div className={styles.insightSection}>
                <h3>At a glance</h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: '#e2e8f0',
                    lineHeight: 1.7,
                  }}
                >
                  {summaryForUi}
                </p>
              </div>
            )}

            {showPremiumGuidance && tipsHasContent(tipsModel) && (
              <div className={styles.insightSection}>
                <h3>Guidance</h3>
                {tipsModel.karmic_theme && (
                  <div className={styles.tipGroup}>
                    <h4>Karmic theme</h4>
                    <p style={{ margin: '0 0 16px', color: '#cbd5e1', lineHeight: 1.65 }}>
                      {tipsModel.karmic_theme}
                    </p>
                  </div>
                )}
                {tipsModel.daily_actions.length > 0 && (
                  <div className={styles.tipGroup}>
                    <h4>Daily actions</h4>
                    <ul>
                      {tipsModel.daily_actions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tipsModel.rituals.length > 0 && (
                  <div className={styles.tipGroup}>
                    <h4>Suggested Rituals</h4>
                    <ul>
                      {tipsModel.rituals.map((ritual, idx) => (
                        <li key={idx}>{ritual}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tipsModel.what_to_manifest.length > 0 && (
                  <div className={styles.tipGroup}>
                    <h4>What To Manifest</h4>
                    <ul>
                      {tipsModel.what_to_manifest.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tipsModel.what_not_to_manifest.length > 0 && (
                  <div className={styles.tipGroup}>
                    <h4>What NOT To Manifest</h4>
                    <ul>
                      {tipsModel.what_not_to_manifest.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tipsModel.thought_alignment.length > 0 && (
                  <div className={styles.tipGroup}>
                    <h4>Thought Alignment Tips</h4>
                    <ul>
                      {tipsModel.thought_alignment.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!dashboardLoading && !showPremiumGuidance && (
              <div
                className={styles.insightSection}
                style={{
                  padding: '16px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 8,
                }}
              >
                <h3 style={{ marginTop: 0 }}>Premium guidance</h3>
                <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6, fontSize: 14 }}>
                  Upgrade from the free plan to unlock karmic themes, daily actions, rituals, thought
                  alignment, and full AI insights for this manifestation.
                </p>
              </div>
            )}

            {dashboardLoading && isViewMode && (
              <p style={{ color: '#94a3b8', fontSize: 14, margin: '8px 0 0' }}>
                Loading your plan to show personalized guidance…
              </p>
            )}

            {showPremiumGuidance && insightsModel && (
              <div className={styles.insightSection}>
                <h3>Insights</h3>

                {insightsModel.summary_for_ui && (
                  <div
                    style={{
                      padding: '14px 16px',
                      background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: '#d1fae5',
                        lineHeight: 1.65,
                      }}
                    >
                      {insightsModel.summary_for_ui}
                    </p>
                  </div>
                )}

                {insightsModel.ai_narrative && (
                  <div
                    className={styles.narrative}
                    style={{
                      padding: '16px',
                      background: 'rgba(251, 191, 36, 0.05)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        color: '#e2e8f0',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                    >
                      {insightsModel.ai_narrative}
                    </p>
                  </div>
                )}

                {insightsModel.astro_insights && (
                  <div
                    className={styles.astroInsights}
                    style={{
                      padding: '16px',
                      background: 'rgba(100, 116, 139, 0.1)',
                      border: '1px solid rgba(100, 116, 139, 0.2)',
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      Astrological Alignment
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: '#cbd5e1',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                    >
                      {insightsModel.astro_insights}
                    </p>
                  </div>
                )}

                {insightsModel.category_label && (
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 12px' }}>
                    <strong style={{ color: '#e2e8f0' }}>Focus area:</strong>{' '}
                    {insightsModel.category_label}
                  </p>
                )}

                {insightsModel.emotional_charge && (
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
                    <strong style={{ color: '#e2e8f0' }}>Emotional tone:</strong>{' '}
                    <span style={{ textTransform: 'capitalize' }}>
                      {insightsModel.emotional_charge}
                    </span>
                  </p>
                )}

                {insightsModel.keyword_analysis &&
                  typeof insightsModel.keyword_analysis === 'object' && (
                    <div
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    >
                      <h4 style={{ margin: '0 0 10px', fontSize: 14, color: '#e2e8f0' }}>
                        Keyword analysis
                      </h4>
                      {insightsModel.keyword_analysis.detected_category && (
                        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#cbd5e1' }}>
                          <strong>Detected:</strong> {insightsModel.keyword_analysis.detected_category}
                        </p>
                      )}
                      {insightsModel.keyword_analysis.category_label && (
                        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#cbd5e1' }}>
                          <strong>Category:</strong> {insightsModel.keyword_analysis.category_label}
                        </p>
                      )}
                      {insightsModel.keyword_analysis.energy_state && (
                        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#cbd5e1' }}>
                          <strong>Energy:</strong>{' '}
                          <span style={{ textTransform: 'capitalize' }}>
                            {insightsModel.keyword_analysis.energy_state}
                          </span>
                        </p>
                      )}
                      {insightsModel.keyword_analysis.energy_reason && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: '#94a3b8',
                            lineHeight: 1.6,
                          }}
                        >
                          {insightsModel.keyword_analysis.energy_reason}
                        </p>
                      )}
                    </div>
                  )}

                <div
                  style={{
                    padding: '16px',
                    background:
                      insightsModel.energy_state === 'aligned'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : insightsModel.energy_state === 'unstable' ||
                            insightsModel.energy_state === 'scattered'
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${
                      insightsModel.energy_state === 'aligned'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : insightsModel.energy_state === 'unstable' ||
                            insightsModel.energy_state === 'scattered'
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)'
                    }`,
                    borderRadius: 8,
                    marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: insightsModel.energy_reason ? 12 : 0,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 13,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Energy State:
                    </strong>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color:
                          insightsModel.energy_state === 'aligned'
                            ? '#10b981'
                            : insightsModel.energy_state === 'unstable' ||
                                insightsModel.energy_state === 'scattered'
                              ? '#f59e0b'
                              : '#ef4444',
                        textTransform: 'capitalize',
                      }}
                    >
                      {insightsModel.energy_state || 'unknown'}
                    </span>
                  </div>
                  {insightsModel.energy_reason && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: `1px solid ${
                          insightsModel.energy_state === 'aligned'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : insightsModel.energy_state === 'unstable' ||
                                insightsModel.energy_state === 'scattered'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)'
                        }`,
                        fontSize: 14,
                        color: '#cbd5e1',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                    >
                      {insightsModel.energy_reason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {showPremiumGuidance && actionWindowsHasContent(actionWindowsModel) && (
              <div className={styles.insightSection}>
                <h3>Recommended action windows</h3>
                {actionWindowsModel.next_optimal_date && (
                  <p style={{ margin: '0 0 12px', color: '#e2e8f0', fontSize: 14 }}>
                    <strong style={{ color: '#94a3b8' }}>Next optimal date:</strong>{' '}
                    {String(actionWindowsModel.next_optimal_date)}
                  </p>
                )}
                {Array.isArray(actionWindowsModel.optimal_dates) &&
                  actionWindowsModel.optimal_dates.length > 0 && (
                    <div className={styles.tipGroup}>
                      <h4>Favorable dates</h4>
                      <ul style={{ margin: 0 }}>
                        {actionWindowsModel.optimal_dates.map((d, idx) => (
                          <li key={idx}>{String(d)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {Array.isArray(actionWindowsModel.planetary_influences) &&
                  actionWindowsModel.planetary_influences.length > 0 && (
                    <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                      {actionWindowsModel.planetary_influences.map((inf, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 14px',
                            background: 'rgba(15, 23, 42, 0.7)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: 8,
                          }}
                        >
                          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                            {inf.date ? String(inf.date) : ''}{' '}
                            {inf.planet ? `· ${inf.planet}` : ''}{' '}
                            {inf.influence ? `· ${inf.influence}` : ''}
                          </div>
                          {inf.description && (
                            <p style={{ margin: 0, fontSize: 14, color: '#cbd5e1', lineHeight: 1.55 }}>
                              {inf.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {showPremiumGuidance && progressTrackingHasContent(progressTrackingModel) && (
              <div className={styles.insightSection}>
                <h3>Progress & alignment</h3>
                {typeof progressTrackingModel.current_progress === 'number' && (
                  <p style={{ margin: '0 0 12px', fontSize: 14, color: '#e2e8f0' }}>
                    <strong style={{ color: '#94a3b8' }}>Current progress:</strong>{' '}
                    {Math.round(progressTrackingModel.current_progress)}%
                  </p>
                )}
                {progressTrackingModel.commitment_message && (
                  <p
                    style={{
                      margin: '0 0 16px',
                      fontSize: 14,
                      color: '#cbd5e1',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {progressTrackingModel.commitment_message}
                  </p>
                )}
                {Array.isArray(progressTrackingModel.milestones) &&
                  progressTrackingModel.milestones.length > 0 && (
                    <div className={styles.tipGroup}>
                      <h4>Milestones</h4>
                      <ul style={{ margin: 0 }}>
                        {progressTrackingModel.milestones.map((m, idx) => (
                          <li key={idx} style={{ marginBottom: 8 }}>
                            {m.date && <span style={{ color: '#94a3b8' }}>{String(m.date)}: </span>}
                            {m.description}
                            {typeof m.progress === 'number' ? ` (${m.progress}%)` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {Array.isArray(progressTrackingModel.alignment_actions) &&
                  progressTrackingModel.alignment_actions.length > 0 && (
                    <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                      <h4 style={{ margin: '0 0 8px' }}>Alignment actions</h4>
                      {progressTrackingModel.alignment_actions.map((a) => (
                        <div
                          key={a.id ?? `${a.title}-${a.added_at}`}
                          style={{
                            padding: '12px 14px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: 8,
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                            {a.title}
                          </div>
                          {a.description && (
                            <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                              {a.description}
                            </p>
                          )}
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                            {a.effort_level && <span>{a.effort_level}</span>}
                            {typeof a.karma_score === 'number' && (
                              <span style={{ marginLeft: 8 }}>Karma +{a.karma_score}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                color: 'var(--primary-color)', 
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
                    minWidth: '220px'
                  }}
                >
                  {calculating ? 'Analyzing...' : 'Analyze & Score'}
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
                      color: 'var(--primary-color)',
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
                      color: 'var(--primary-color)',
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
                        color: 'var(--primary-color)',
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
                      color: 'var(--primary-color)',
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


