import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { manifestationApi } from '../../common/api/manifestationApi';
import styles from './ManifestationResonanceScreen.module.css';

const PENDING_KEY = 'ibhakt_pending_manifestation';

function ManifestationResonanceScreen() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('resonance');
  const [error, setError] = useState(null);
  const hasAutoSubmitted = useRef(false);

  const isLoggedIn = () => !!localStorage.getItem('ibhakt_token');

  // On mount: check for pending manifestation saved before login redirect
  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      setDescription(pending);
      // If user just came back from auth, auto-submit
      if (isLoggedIn() && !hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true;
        localStorage.removeItem(PENDING_KEY);
        doCalculate(pending);
      }
    }
  }, []);

  const doCalculate = async (text) => {
    const desc = (text || '').trim();
    if (desc.length < 15) {
      setError('Description must be at least 15 characters long.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await manifestationApi.calculateResonance(desc);
      setResult(data);
      setActiveTab('resonance');
    } catch (err) {
      setError(err.message || 'Failed to calculate resonance score.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!description.trim() || description.trim().length < 15) {
      setError('Description must be at least 15 characters long.');
      return;
    }

    // If not logged in, save text and redirect to login
    if (!isLoggedIn()) {
      localStorage.setItem(PENDING_KEY, description.trim());
      navigate('/login', { state: { from: '/manifestations' } });
      return;
    }

    doCalculate(description);
  };

  const handleClear = () => {
    setDescription('');
    setResult(null);
    setError(null);
    setActiveTab('resonance');
    localStorage.removeItem(PENDING_KEY);
  };

  const handleLock = async () => {
    if (!result) return;

    // If not logged in, save text and redirect to login
    if (!isLoggedIn()) {
      localStorage.setItem(PENDING_KEY, description.trim());
      navigate('/login', { state: { from: '/manifestations' } });
      return;
    }

    try {
      setLoading(true);
      await manifestationApi.createManifestation({
        description: description.trim(),
      });
      // Redirect to dashboard after successful lock
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to lock manifestation: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Input Section */}
      <div className={styles.inputSection}>
        <h1 className={styles.title}>Describe Your Manifestation</h1>
        <div className={styles.inputWrapper}>
          <textarea
            className={styles.textInput}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="I have become CM of Maharashtra in 2029"
            rows={4}
          />
          {description.length > 0 && description.length < 15 && (
            <div className={styles.charCount}>
              {description.length}/15 minimum
            </div>
          )}
        </div>
        <button
          className={styles.calculateButton}
          onClick={handleCalculate}
          disabled={loading || description.trim().length < 15}
        >
          {loading ? 'Calculating...' : 'Calculate Resonance Score & Generate Reading'}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      {/* Results Section */}
      {result && (
        <>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>Manifestation Resonance Score</h2>
            <button className={styles.clearButton} onClick={handleClear}>
              Clear & Enter New Manifestation
            </button>
          </div>

          {/* Lock Manifestation Box */}
          <div className={styles.lockBox}>
            <div className={styles.lockContent}>
              <div className={styles.lockIcon}>🔒</div>
              <div className={styles.lockText}>
                <h3>Lock Your Manifestation</h3>
                <p>
                  Lock this manifestation to add actionable tips to your Daily Alignment Tips.
                  These tips will help you align with your Dasha periods and improve your karma.
                </p>
              </div>
            </div>
            <button className={styles.lockButton} onClick={handleLock}>
              🔒 Lock Manifestation
            </button>
          </div>

          {/* Main Score Display */}
          <div className={styles.scoreSection}>
            <div className={styles.scoreLeft}>
              <div className={styles.categoryBox}>
                <span className={styles.categoryLabel}>CATEGORY</span>
                <span className={styles.categoryValue}>
                  {result.category_label || result.category || 'General'}
                </span>
              </div>
              <div className={styles.resonanceScore}>
                <div className={styles.scoreValue}>
                  {result.resonance_score}%
                </div>
                <div className={styles.scoreLabel}>Resonance Score</div>
              </div>
            </div>
            <div className={styles.scoreRight}>
              <div className={styles.manifestationClassBox}>
                <span className={styles.classLabel}>MANIFESTATION CLASS</span>
                <div className={styles.classValue}>
                  {result.manifestation_class_label}
                </div>
                <div className={styles.classSubtext}>
                  {result.manifestation_class_label.split(' - ')[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Supportive and Challenging Factors */}
          <div className={styles.factorsSection}>
            <div className={styles.factorsColumn}>
              <h3 className={styles.factorsTitle}>
                <span className={styles.checkIcon}>✔</span> Supportive Factors
              </h3>
              {result.supportive_factors && result.supportive_factors.length > 0 ? (
                result.supportive_factors.map((factor, idx) => (
                  <div key={idx} className={styles.factorCard}>
                    <div className={styles.factorDescription}>{factor.description}</div>
                    {factor.period && (
                      <div className={styles.factorPeriod}>{factor.period}</div>
                    )}
                    <div className={styles.factorScore}>Score: {factor.score}%</div>
                  </div>
                ))
              ) : (
                <div className={styles.noFactors}>No supportive factors identified.</div>
              )}
            </div>
            <div className={styles.factorsColumn}>
              <h3 className={styles.factorsTitle}>
                <span className={styles.warningIcon}>⚠</span> Challenging Factors
              </h3>
              {result.challenging_factors && result.challenging_factors.length > 0 ? (
                result.challenging_factors.map((factor, idx) => (
                  <div key={idx} className={styles.factorCardChallenging}>
                    <div className={styles.factorDescription}>{factor.description}</div>
                    <div className={styles.factorImpact}>Impact: {factor.impact}%</div>
                  </div>
                ))
              ) : (
                <div className={styles.noFactors}>No challenging factors identified.</div>
              )}
            </div>
          </div>

          {/* Dasha Resonance Details */}
          {result.dasha_resonance && (
            <div className={styles.dashaSection}>
              <h2 className={styles.dashaTitle}>Manifestation Resonance Score Details</h2>
              <p className={styles.dashaSubtitle}>
                This analysis shows how supportive or challenging each Dasha level is for your
                manifestation based on planetary energies and themes.
              </p>
              <div className={styles.dashaLevels}>
                {['mahadasha', 'antardasha', 'pratyantar', 'sukshma'].map((level) => {
                  const dasha = result.dasha_resonance[level];
                  if (!dasha || dasha.lord === 'Unknown') return null;
                  return (
                    <div key={level} className={styles.dashaLevel}>
                      <div className={styles.dashaHeader}>
                        <div className={styles.dashaIcon}>
                          {level === 'mahadasha' && '🌙'}
                          {level === 'antardasha' && '⭐'}
                          {level === 'pratyantar' && '🔴'}
                          {level === 'sukshma' && '💜'}
                        </div>
                        <div className={styles.dashaName}>
                          {dasha.lord} {level.charAt(0).toUpperCase() + level.slice(1)} Resonance
                        </div>
                      </div>
                      <div className={styles.dashaStats}>
                        Supportive: {dasha.supportive}%
                      </div>
                      <div className={styles.dashaBar}>
                        <div
                          className={styles.dashaBarSupportive}
                          style={{ width: `${dasha.supportive}%` }}
                        />
                        <div
                          className={styles.dashaBarChallenging}
                          style={{ width: `${dasha.challenging}%` }}
                        />
                      </div>
                      <div className={styles.dashaStats}>
                        Challenging: {dasha.challenging}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Navigation Tabs */}
          <div className={styles.tabsSection}>
            <button
              className={`${styles.tab} ${activeTab === 'mahadasha' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('mahadasha')}
            >
              <span className={styles.tabIcon}>☑</span> Mahadasha
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'antardasha' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('antardasha')}
            >
              <span className={styles.tabIcon}>⭐</span> Antardasha
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'what_to_manifest' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('what_to_manifest')}
            >
              <span className={styles.tabIcon}>✔</span> What to Manifest
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'what_not_to_manifest' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('what_not_to_manifest')}
            >
              <span className={styles.tabIcon}>✗</span> What NOT to Manifest
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'karmic_theme' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('karmic_theme')}
            >
              <span className={styles.tabIcon}>☁</span> Karmic Theme
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'thought_alignment' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('thought_alignment')}
            >
              <span className={styles.tabIcon}>💭</span> Thought Alignment
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'rituals' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('rituals')}
            >
              <span className={styles.tabIcon}>🧘</span> Rituals
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'manifestation_window' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('manifestation_window')}
            >
              <span className={styles.tabIcon}>⏰</span> Manifestation Window
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'mahadasha' && result.dasha_resonance?.mahadasha && (
              <div>
                <h3>Mahadasha: {result.dasha_resonance.mahadasha.lord}</h3>
                <p>Period: {result.dasha_resonance.mahadasha.period}</p>
                <p>Supportive: {result.dasha_resonance.mahadasha.supportive}%</p>
                <p>Challenging: {result.dasha_resonance.mahadasha.challenging}%</p>
              </div>
            )}
            {activeTab === 'antardasha' && result.dasha_resonance?.antardasha && (
              <div>
                <h3>Antardasha: {result.dasha_resonance.antardasha.lord}</h3>
                <p>Period: {result.dasha_resonance.antardasha.period}</p>
                <p>Supportive: {result.dasha_resonance.antardasha.supportive}%</p>
                <p>Challenging: {result.dasha_resonance.antardasha.challenging}%</p>
              </div>
            )}
            {activeTab === 'what_to_manifest' && result.tips?.what_to_manifest && (
              <div>
                <h3>What To Manifest</h3>
                <ul>
                  {result.tips.what_to_manifest.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'what_not_to_manifest' && result.tips?.what_not_to_manifest && (
              <div>
                <h3>What NOT To Manifest</h3>
                <ul>
                  {result.tips.what_not_to_manifest.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'thought_alignment' && result.tips?.thought_alignment && (
              <div>
                <h3>Thought Alignment</h3>
                <ul>
                  {result.tips.thought_alignment.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'rituals' && result.tips?.rituals && (
              <div>
                <h3>Rituals</h3>
                <ul>
                  {result.tips.rituals.map((ritual, idx) => (
                    <li key={idx}>{ritual}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'manifestation_window' && (
              <div>
                <h3>Manifestation Window</h3>
                <p>Optimal timing information will be displayed here.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ManifestationResonanceScreen;


