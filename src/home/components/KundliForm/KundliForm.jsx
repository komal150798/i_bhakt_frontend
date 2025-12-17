import { useState } from 'react';
import { homeApi } from '../../../api/homeApi';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import Loader from '../../../common/components/Loader/Loader';
import styles from './KundliForm.module.css';

const INITIAL_FORM_DATA = {
  fullName: '',
  dateOfBirth: '',
  timeOfBirth: '',
  placeOfBirth: '',
};

function KundliForm() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [kundliData, setKundliData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
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
                        <input
                          type="text"
                          className="form-control"
                          id="placeOfBirth"
                          name="placeOfBirth"
                          value={formData.placeOfBirth}
                          onChange={handleChange}
                          placeholder="City, State"
                          required
                        />
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
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        setKundliData(null);
                        setSuccess(false);
                        setFormData(INITIAL_FORM_DATA);
                      }}
                    >
                      <i className="bi bi-x-lg me-1"></i>
                      {t('kundli.results.close') || 'Close'}
                    </button>
                  </div>

                  {/* Basic Information */}
                  <div className={styles.basicInfo}>
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <div className={styles.infoCard}>
                          <div className={styles.infoLabel}>
                            {t('kundli.results.birthDate') || 'Birth Date'}
                          </div>
                          <div className={styles.infoValue}>
                            {new Date(kundliData.birth_date).toLocaleDateString()}
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
