import { useState } from 'react';
import { homeApi } from '../../../api/homeApi';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import { useAuth } from '../../../common/context/AuthContext';
import Loader from '../../../common/components/Loader/Loader';
import LocationAutocomplete from '../../../components/common/LocationAutocomplete';
import styles from './KundliForm.module.css';

const INITIAL_FORM_DATA = {
  fullName: '',
  dateOfBirth: '',
  timeOfBirth: '',
  placeOfBirth: '',
  latitude: null,
  longitude: null,
  timezone: 'Asia/Kolkata',
};

/**
 * Format date to dd/mm/yyyy format
 * @param {string} dateStr - Date string to format
 * @returns {string} Formatted date string
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format duration in years to a human-readable format
 * @param {number} years - Duration in years
 * @returns {string} Formatted duration string
 */
function formatDuration(years) {
  if (years >= 1) {
    return `${years.toFixed(2)} yr`;
  } else if (years >= 1 / 12) {
    const months = years * 12;
    return `${months.toFixed(1)} mo`;
  } else {
    const days = Math.round(years * 365);
    return `${days} days`;
  }
}

function KundliForm() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [kundliData, setKundliData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Handle location autocomplete selection
  const handleLocationChange = (value) => {
    setFormData((prev) => ({ ...prev, placeOfBirth: value }));
    setError(null);
  };

  const handleLocationSelect = (locationData) => {
    setFormData((prev) => ({
      ...prev,
      placeOfBirth: locationData.placeName,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timezone: locationData.timezone || 'Asia/Kolkata',
    }));
    setError(null);
  };

  /**
   * Handle PDF download - only available for authenticated users
   */
  const handleDownloadPdf = async () => {
    if (!isAuthenticated) {
      setPdfError('Please login to download the PDF report.');
      return;
    }

    if (!kundliData) {
      setPdfError('No kundli data available to download.');
      return;
    }

    setIsPdfLoading(true);
    setPdfError(null);

    try {
      // Prepare PDF data with dasha information
      const pdfData = {
        name: kundliData.name,
        birth_date: kundliData.birth_date,
        birth_time: kundliData.birth_time,
        birth_place: kundliData.birth_place,
        latitude: kundliData.latitude,
        longitude: kundliData.longitude,
        timezone: kundliData.timezone,
        lagna: kundliData.lagna,
        nakshatra: kundliData.nakshatra,
        planets: kundliData.planets,
        houses: kundliData.houses,
        ayanamsa: kundliData.ayanamsa,
        tithi: kundliData.tithi,
        yoga: kundliData.yoga,
        karana: kundliData.karana,
        // Include dasha data from full_data if available
        dasha_timeline: kundliData.full_data?.dasha_timeline || kundliData.dasha_timeline,
      };

      const pdfBlob = await homeApi.downloadKundliPdf(pdfData);

      // Create download link and trigger download
      const url = globalThis.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = kundliData.name.replaceAll(/[^a-zA-Z0-9\s]/g, '').replaceAll(/\s+/g, '_');
      link.download = `Kundli_Report_${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      if (err.response?.status === 401) {
        setPdfError('Please login to download the PDF report.');
      } else {
        setPdfError(err.response?.data?.message || err.message || 'Failed to download PDF. Please try again.');
      }
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Transform form data to match backend DTO format
      const kundliData = {
        name: formData.fullName,
        birth_date: formData.dateOfBirth,
        birth_time: formData.timeOfBirth ? `${formData.timeOfBirth}:00` : '12:00:00', // Add seconds if not present
        birth_place: formData.placeOfBirth,
        // Include coordinates if available from location autocomplete
        ...(formData.latitude && { latitude: formData.latitude }),
        ...(formData.longitude && { longitude: formData.longitude }),
        ...(formData.timezone && { timezone: formData.timezone }),
      };

      // Ensure time format is HH:MM:SS
      if (kundliData.birth_time && !kundliData.birth_time.includes(':')) {
        kundliData.birth_time = '12:00:00';
      } else if (kundliData.birth_time && kundliData.birth_time.split(':').length === 2) {
        kundliData.birth_time = `${kundliData.birth_time}:00`;
      }

      const response = await homeApi.generateKundli(kundliData);
      // Extract data from response (handle both wrapped and direct responses)
      const result = response.data || response;
      setKundliData(result);
      setSuccess(true);
      // Don't reset form - keep it for reference
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate kundli. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.kundliSection}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className={`card ${styles.kundliCard}`}>
              <div className="card-body p-4 p-md-5">
                <div className="row align-items-center">
                  <div className="col-lg-6 mb-4 mb-lg-0">
                    <h3 className="fw-bold mb-3">{t('kundli.title')}</h3>
                    <p className="text-muted mb-4">{t('kundli.subtitle')}</p>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        Accurate planetary positions
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        Detailed house analysis
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        Free and instant results
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-6">
                    <form onSubmit={handleSubmit}>
                      {error && (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}
                      {success && !kundliData && (
                        <div className="alert alert-success" role="alert">
                          Kundli generated successfully!
                        </div>
                      )}
                      <div className="mb-3">
                        <label htmlFor="fullName" className="form-label">
                          {t('kundli.form.name')}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="dateOfBirth" className="form-label">
                          {t('kundli.form.dob')}
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="timeOfBirth" className="form-label">
                          {t('kundli.form.tob')}
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          id="timeOfBirth"
                          name="timeOfBirth"
                          value={formData.timeOfBirth}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="placeOfBirth" className="form-label">
                          {t('kundli.form.place')}
                        </label>
                        <LocationAutocomplete
                          id="placeOfBirth"
                          name="placeOfBirth"
                          value={formData.placeOfBirth}
                          onChange={handleLocationChange}
                          onLocationSelect={handleLocationSelect}
                          placeholder={t('kundli.form.placePlaceholder') || 'Search city, state...'}
                          inputClassName="form-control"
                          required
                        />
                        {formData.latitude && formData.longitude && (
                          <small className="text-muted mt-1 d-block">
                            <i className="bi bi-geo-alt-fill me-1"></i>
                            {formData.latitude.toFixed(4)}°, {formData.longitude.toFixed(4)}°
                          </small>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader size="sm" /> {t('kundli.form.generating')}
                          </>
                        ) : (
                          t('kundli.form.submit')
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Kundli Results Display */}
            {kundliData && (
              <div className={`card ${styles.kundliResultCard} mt-4`}>
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">
                      <i className="bi bi-stars me-2"></i>
                      {kundliData.name}'s {t('kundli.results.title') || 'Kundli'}
                    </h2>
                    <div className="d-flex gap-2">
                      {/* Download PDF Button - Only visible for authenticated users */}
                      {isAuthenticated && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={handleDownloadPdf}
                          disabled={isPdfLoading}
                          title={t('kundli.results.downloadPdf') || 'Download PDF Report'}
                        >
                          {isPdfLoading ? (
                            <>
                              <Loader size="sm" /> {t('kundli.results.generatingPdf') || 'Generating...'}
                            </>
                          ) : (
                            <>
                              <i className="bi bi-file-earmark-pdf me-1"></i>
                              {t('kundli.results.downloadPdf') || 'Download PDF'}
                            </>
                          )}
                        </button>
                      )}
                      {/* Login prompt for non-authenticated users */}
                      {!isAuthenticated && (
                        <span className="text-muted small align-self-center me-2" title="Login required to download PDF">
                          <i className="bi bi-lock me-1"></i>
                          {t('kundli.results.loginForPdf') || 'Login to download PDF'}
                        </span>
                      )}
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          setKundliData(null);
                          setSuccess(false);
                          setFormData(INITIAL_FORM_DATA);
                          setPdfError(null);
                        }}
                      >
                        <i className="bi bi-x-lg me-1"></i>
                        {t('kundli.results.close') || 'Close'}
                      </button>
                    </div>
                  </div>

                  {/* PDF Error Alert */}
                  {pdfError && (
                    <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {pdfError}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setPdfError(null)}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className={styles.basicInfo}>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <div className={styles.infoCard}>
                          <div className={styles.infoLabel}>
                            {t('kundli.results.birthDate') || 'Birth Date'}
                          </div>
                          <div className={styles.infoValue}>
                            {formatDate(kundliData.birth_date)}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className={styles.infoCard}>
                          <div className={styles.infoLabel}>
                            {t('kundli.results.birthTime') || 'Birth Time'}
                          </div>
                          <div className={styles.infoValue}>{kundliData.birth_time}</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className={styles.infoCard}>
                          <div className={styles.infoLabel}>
                            {t('kundli.results.birthPlace') || 'Birth Place'}
                          </div>
                          <div className={styles.infoValue}>{kundliData.birth_place}</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className={styles.infoCard}>
                          <div className={styles.infoLabel}>Ayanamsa</div>
                          <div className={styles.infoValue}>{kundliData.ayanamsa?.toFixed(2)}°</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lagna & Nakshatra */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className={styles.highlightCard}>
                        <div className={styles.highlightIcon}>
                          <i className="bi bi-compass"></i>
                        </div>
                        <div className={styles.highlightContent}>
                          <div className={styles.highlightLabel}>
                            {t('kundli.results.lagna') || 'Lagna (Ascendant)'}
                          </div>
                          <div className={styles.highlightValue}>{kundliData.lagna?.sign}</div>
                          <div className={styles.highlightSubtext}>
                            {kundliData.lagna?.degrees?.toFixed(2)}° • {t('kundli.results.lord') || 'Lord'}: {kundliData.lagna?.lord}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className={styles.highlightCard}>
                        <div className={styles.highlightIcon}>
                          <i className="bi bi-moon-stars"></i>
                        </div>
                        <div className={styles.highlightContent}>
                          <div className={styles.highlightLabel}>
                            {t('kundli.results.nakshatra') || 'Nakshatra'}
                          </div>
                          <div className={styles.highlightValue}>{kundliData.nakshatra?.name}</div>
                          <div className={styles.highlightSubtext}>
                            {t('kundli.results.pada') || 'Pada'} {kundliData.nakshatra?.pada} • {t('kundli.results.lord') || 'Lord'}: {kundliData.nakshatra?.lord}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tithi, Yoga, Karana */}
                  {(kundliData.tithi || kundliData.yoga || kundliData.karana) && (
                    <div className="row g-3 mb-4">
                      {kundliData.tithi && (
                        <div className="col-md-4">
                          <div className={styles.smallInfoCard}>
                            <div className={styles.smallInfoLabel}>
                              {t('kundli.results.tithi') || 'Tithi'}
                            </div>
                            <div className={styles.smallInfoValue}>{kundliData.tithi}</div>
                          </div>
                        </div>
                      )}
                      {kundliData.yoga && (
                        <div className="col-md-4">
                          <div className={styles.smallInfoCard}>
                            <div className={styles.smallInfoLabel}>
                              {t('kundli.results.yoga') || 'Yoga'}
                            </div>
                            <div className={styles.smallInfoValue}>{kundliData.yoga}</div>
                          </div>
                        </div>
                      )}
                      {kundliData.karana && (
                        <div className="col-md-4">
                          <div className={styles.smallInfoCard}>
                            <div className={styles.smallInfoLabel}>
                              {t('kundli.results.karana') || 'Karana'}
                            </div>
                            <div className={styles.smallInfoValue}>{kundliData.karana}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vimshottari Dasha */}
                  {kundliData.dasha_timeline?.vimshottari && (
                    <div className={styles.dashaSection + ' mb-4'}>
                      <h3 className={styles.sectionTitle}>
                        <i className="bi bi-calendar3 me-2"></i>
                        {t('kundli.results.vimshottariDasha') || 'Vimshottari Dasha'}
                      </h3>
                      <div className="row g-3 mb-3">
                        <div className="col-md-4">
                          <div className={styles.highlightCard}>
                            <div className={styles.highlightContent}>
                              <div className={styles.highlightLabel}>
                                {t('kundli.results.mahadasha') || 'Mahadasha'}
                              </div>
                              <div className={styles.highlightValue}>
                                {kundliData.dasha_timeline.vimshottari.current_mahadasha || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className={styles.highlightCard}>
                            <div className={styles.highlightContent}>
                              <div className={styles.highlightLabel}>
                                {t('kundli.results.antardasha') || 'Antardasha'}
                              </div>
                              <div className={styles.highlightValue}>
                                {kundliData.dasha_timeline.vimshottari.current_antardasha || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className={styles.highlightCard}>
                            <div className={styles.highlightContent}>
                              <div className={styles.highlightLabel}>
                                {t('kundli.results.pratyantar') || 'Pratyantar'}
                              </div>
                              <div className={styles.highlightValue}>
                                {kundliData.dasha_timeline.vimshottari.current_pratyantar || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Mahadasha Timeline */}
                      {kundliData.dasha_timeline.vimshottari.mahadasha && (
                        <div className={styles.dashaTimeline}>
                          <h4 className={styles.subSectionTitle}>
                            {t('kundli.results.mahadashaTimeline') || 'Mahadasha Timeline'}
                          </h4>
                          <div className="table-responsive">
                            <table className="table table-sm table-hover">
                              <thead>
                                <tr>
                                  <th>{t('kundli.results.lord') || 'Lord'}</th>
                                  <th>{t('kundli.results.startDate') || 'Start'}</th>
                                  <th>{t('kundli.results.endDate') || 'End'}</th>
                                  <th>{t('kundli.results.duration') || 'Duration'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {kundliData.dasha_timeline.vimshottari.mahadasha.map((dasha) => (
                                  <tr
                                    key={dasha.lord}
                                    className={
                                      dasha.lord === kundliData.dasha_timeline.vimshottari.current_mahadasha
                                        ? styles.currentDashaRow
                                        : ''
                                    }
                                  >
                                    <td>
                                      <strong>{dasha.lord}</strong>
                                      {dasha.lord === kundliData.dasha_timeline.vimshottari.current_mahadasha && (
                                        <span className="badge bg-primary ms-2">Current</span>
                                      )}
                                    </td>
                                    <td>{formatDate(dasha.start)}</td>
                                    <td>{formatDate(dasha.end)}</td>
                                    <td>{dasha.duration_years} years</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Detailed Dasha Timeline (Mahadasha > Antardasha > Pratyantar) */}
                      {kundliData.dasha_timeline.vimshottari.detailed_timeline &&
                        kundliData.dasha_timeline.vimshottari.detailed_timeline.length > 0 && (
                        <div className={styles.detailedDashaTimeline}>
                          <h4 className={styles.subSectionTitle}>
                            <i className="bi bi-list-nested me-2"></i>
                            {t('kundli.results.detailedDashaTimeline') || 'Detailed Dasha Timeline'}
                          </h4>
                          <p className={styles.dashaSubtext}>
                            {t('kundli.results.detailedDashaDescription') || 'Complete breakdown showing Mahadasha, Antardasha, and Pratyantar periods with exact dates'}
                          </p>
                          <div className={`table-responsive ${styles.detailedDashaTableWrapper}`}>
                            <table className={`table table-sm ${styles.detailedDashaTable}`}>
                              <thead className={styles.detailedDashaHeader}>
                                <tr>
                                  <th>{t('kundli.results.mahadasha') || 'Mahadasha'}</th>
                                  <th>{t('kundli.results.antardasha') || 'Antardasha'}</th>
                                  <th>{t('kundli.results.pratyantar') || 'Pratyantar'}</th>
                                  <th>{t('kundli.results.startDate') || 'Start Date'}</th>
                                  <th>{t('kundli.results.endDate') || 'End Date'}</th>
                                  <th>{t('kundli.results.duration') || 'Duration'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {kundliData.dasha_timeline.vimshottari.detailed_timeline.map((period, index) => {
                                  const isCurrentPeriod =
                                    period.mahadasha === kundliData.dasha_timeline.vimshottari.current_mahadasha &&
                                    period.antardasha === kundliData.dasha_timeline.vimshottari.current_antardasha &&
                                    period.pratyantar === kundliData.dasha_timeline.vimshottari.current_pratyantar;

                                  const prevPeriod = index > 0
                                    ? kundliData.dasha_timeline.vimshottari.detailed_timeline[index - 1]
                                    : null;
                                  const showMaha = !prevPeriod || prevPeriod.mahadasha !== period.mahadasha;
                                  const showAntara = !prevPeriod || prevPeriod.antardasha !== period.antardasha || showMaha;

                                  return (
                                    <tr
                                      key={`${period.mahadasha}-${period.antardasha}-${period.pratyantar}-${index}`}
                                      className={`
                                        ${isCurrentPeriod ? styles.currentDetailedRow : ''}
                                        ${showMaha ? styles.mahadashaGroupStart : ''}
                                      `}
                                    >
                                      <td className={styles.mahadashaCell}>
                                        {showMaha && <strong>{period.mahadasha}</strong>}
                                      </td>
                                      <td className={styles.antardashaCell}>
                                        {showAntara && <strong>{period.antardasha}</strong>}
                                      </td>
                                      <td className={styles.pratyantarCell}>
                                        {period.pratyantar}
                                        {isCurrentPeriod && (
                                          <span className="badge bg-success ms-2">Current</span>
                                        )}
                                      </td>
                                      <td>{formatDate(period.start_date)}</td>
                                      <td>{formatDate(period.end_date)}</td>
                                      <td>{formatDuration(period.duration_years)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Planetary Positions */}
                  {kundliData.planets && kundliData.planets.length > 0 && (
                    <div className={styles.planetsSection}>
                      <h3 className={styles.sectionTitle}>
                        <i className="bi bi-planet me-2"></i>
                        {t('kundli.results.planetaryPositions') || 'Planetary Positions'}
                      </h3>
                      <div className="row g-3">
                        {kundliData.planets.map((planet, index) => (
                          <div key={index} className="col-md-6 col-lg-4">
                            <div className={styles.planetCard}>
                              <div className={styles.planetHeader}>
                                <span className={styles.planetName}>{planet.name}</span>
                                {planet.is_retrograde && (
                                  <span className={styles.retrogradeBadge}>R</span>
                                )}
                              </div>
                              <div className={styles.planetDetails}>
                                <div className={styles.planetDetailRow}>
                                  <span className={styles.detailLabel}>
                                    {t('kundli.results.sign') || 'Sign'}:
                                  </span>
                                  <span className={styles.detailValue}>{planet.sign}</span>
                                </div>
                                <div className={styles.planetDetailRow}>
                                  <span className={styles.detailLabel}>
                                    {t('kundli.results.lord') || 'Lord'}:
                                  </span>
                                  <span className={styles.detailValue}>{planet.sign_lord}</span>
                                </div>
                                <div className={styles.planetDetailRow}>
                                  <span className={styles.detailLabel}>
                                    {t('kundli.results.house') || 'House'}:
                                  </span>
                                  <span className={styles.detailValue}>{planet.house || 'N/A'}</span>
                                </div>
                                <div className={styles.planetDetailRow}>
                                  <span className={styles.detailLabel}>
                                    {t('kundli.results.nakshatra') || 'Nakshatra'}:
                                  </span>
                                  <span className={styles.detailValue}>
                                    {planet.nakshatra} ({t('kundli.results.pada') || 'Pada'} {planet.nakshatra_pada})
                                  </span>
                                </div>
                                <div className={styles.planetDetailRow}>
                                  <span className={styles.detailLabel}>
                                    {t('kundli.results.longitude') || 'Longitude'}:
                                  </span>
                                  <span className={styles.detailValue}>
                                    {planet.longitude?.toFixed(2)}°
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Houses */}
                  {kundliData.houses && kundliData.houses.length > 0 && (
                    <div className={styles.housesSection}>
                      <h3 className={styles.sectionTitle}>
                        <i className="bi bi-grid-3x3 me-2"></i>
                        {t('kundli.results.houses') || 'Houses'}
                      </h3>
                      <div className="row g-3">
                        {kundliData.houses.map((house, index) => (
                          <div key={index} className="col-md-4 col-lg-3">
                            <div className={styles.houseCard}>
                              <div className={styles.houseNumber}>
                                {t('kundli.results.house') || 'House'} {house.house_number}
                              </div>
                              <div className={styles.houseSign}>{house.sign}</div>
                              <div className={styles.houseLord}>
                                {t('kundli.results.lord') || 'Lord'}: {house.sign_lord}
                              </div>
                              <div className={styles.houseDegrees}>
                                {house.start_degree?.toFixed(1)}° - {house.end_degree?.toFixed(1)}°
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default KundliForm;
