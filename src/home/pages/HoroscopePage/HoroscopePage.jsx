import { useState, useEffect } from 'react';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import { useAuth } from '../../../common/hooks/useAuth';
import { useToast } from '../../../common/hooks/useToast';
import { handleApiError } from '../../../common/utils/apiErrorHandler';
import * as horoscopeApi from '../../../common/api/horoscopeApi';
import Loader from '../../../common/components/Loader/Loader';
import styles from './HoroscopePage.module.css';

const ZODIAC_SIGNS = [
  { value: 'Aries', label: 'Aries', emoji: '♈' },
  { value: 'Taurus', label: 'Taurus', emoji: '♉' },
  { value: 'Gemini', label: 'Gemini', emoji: '♊' },
  { value: 'Cancer', label: 'Cancer', emoji: '♋' },
  { value: 'Leo', label: 'Leo', emoji: '♌' },
  { value: 'Virgo', label: 'Virgo', emoji: '♍' },
  { value: 'Libra', label: 'Libra', emoji: '♎' },
  { value: 'Scorpio', label: 'Scorpio', emoji: '♏' },
  { value: 'Sagittarius', label: 'Sagittarius', emoji: '♐' },
  { value: 'Capricorn', label: 'Capricorn', emoji: '♑' },
  { value: 'Aquarius', label: 'Aquarius', emoji: '♒' },
  { value: 'Pisces', label: 'Pisces', emoji: '♓' },
];

function HoroscopePage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { showError, showInfo } = useToast();
  const [selectedSign, setSelectedSign] = useState('');
  const [horoscope, setHoroscope] = useState(null);
  const [selectedType, setSelectedType] = useState('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [usePersonalized, setUsePersonalized] = useState(false);

  // Auto-load personalized horoscope if user is logged in and has birth date
  useEffect(() => {
    if (isAuthenticated && user && !selectedSign && !horoscope) {
      loadPersonalizedHoroscope('daily');
    }
  }, [isAuthenticated, user]);

  const loadPersonalizedHoroscope = async (type) => {
    setIsLoading(true);
    setSelectedType(type);
    setUsePersonalized(true);

    try {
      const data = await horoscopeApi.getMyHoroscope(type);
      setHoroscope(data);
      setSelectedSign(data.sign); // Set the calculated sign
    } catch (error) {
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Birth date') || errorMessage.includes('profile')) {
        showInfo(t('horoscope.info.noBirthDate'), {
          description: t('horoscope.info.noBirthDateDesc'),
        });
        setUsePersonalized(false);
      } else {
        showError(t('horoscope.errors.fetchFailed'), {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetHoroscope = async (type) => {
    setIsLoading(true);
    setSelectedType(type);

    try {
      let data;
      
      // If user is logged in, prioritize personalized horoscope
      if (isAuthenticated && user) {
        // If no sign selected, use personalized (backend will calculate from birth date)
        if (!selectedSign) {
          try {
            // Call main endpoint without sign - backend will use user's birth date
            data = await horoscopeApi.getHoroscope(null, type);
            setUsePersonalized(true);
            setSelectedSign(data.sign); // Set the calculated sign
          } catch (error) {
            const errorMessage = handleApiError(error);
            if (errorMessage.includes('Birth date') || errorMessage.includes('profile')) {
              showError(t('horoscope.errors.selectSign'), {
                description: t('horoscope.errors.selectSignDesc'),
              });
              setIsLoading(false);
              return;
            }
            throw error;
          }
        } else {
          // User selected a sign, use that sign (but still send token for tracking)
          setUsePersonalized(false);
          if (type === 'daily') {
            data = await horoscopeApi.getDailyHoroscope(selectedSign);
          } else if (type === 'weekly') {
            data = await horoscopeApi.getWeeklyHoroscope(selectedSign);
          } else {
            data = await horoscopeApi.getMonthlyHoroscope(selectedSign);
          }
        }
      } else {
        // Not logged in, require sign selection
        if (!selectedSign) {
          showError(t('horoscope.errors.selectSign'), {
            description: t('horoscope.errors.selectSignDesc'),
          });
          setIsLoading(false);
          return;
        }
        setUsePersonalized(false);
        // Use selected sign
        if (type === 'daily') {
          data = await horoscopeApi.getDailyHoroscope(selectedSign);
        } else if (type === 'weekly') {
          data = await horoscopeApi.getWeeklyHoroscope(selectedSign);
        } else {
          data = await horoscopeApi.getMonthlyHoroscope(selectedSign);
        }
      }
      
      setHoroscope(data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      showError(t('horoscope.errors.fetchFailed'), {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSignData = ZODIAC_SIGNS.find((s) => s.value === selectedSign);

  return (
    <div className={styles.horoscopePage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{t('horoscope.title')}</h1>
          <p className={styles.subtitle}>{t('horoscope.subtitle')}</p>
        </div>

        {/* Zodiac Sign Selection */}
        <div className={styles.selectionCard}>
          <label htmlFor="zodiacSign" className={styles.label}>
            {t('horoscope.selectSign')}
          </label>
          <select
            id="zodiacSign"
            className={styles.select}
            value={selectedSign}
            onChange={(e) => {
              setSelectedSign(e.target.value);
              setHoroscope(null);
            }}
          >
            <option value="">{t('horoscope.chooseSign')}</option>
            {ZODIAC_SIGNS.map((sign) => (
              <option key={sign.value} value={sign.value}>
                {sign.emoji} {sign.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Buttons */}
        {selectedSign && (
          <div className={styles.typeButtons}>
            <button
              className={`${styles.typeButton} ${selectedType === 'daily' ? styles.active : ''}`}
              onClick={() => handleGetHoroscope('daily')}
              disabled={isLoading}
            >
              {t('horoscope.daily')}
            </button>
            <button
              className={`${styles.typeButton} ${selectedType === 'weekly' ? styles.active : ''}`}
              onClick={() => handleGetHoroscope('weekly')}
              disabled={isLoading}
            >
              {t('horoscope.weekly')}
            </button>
            <button
              className={`${styles.typeButton} ${selectedType === 'monthly' ? styles.active : ''}`}
              onClick={() => handleGetHoroscope('monthly')}
              disabled={isLoading}
            >
              {t('horoscope.monthly')}
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        )}

        {/* Horoscope Display */}
        {horoscope && !isLoading && (
          <div className={styles.horoscopeCard}>
            <div className={styles.horoscopeHeader}>
              <div className={styles.signInfo}>
                {selectedSignData && (
                  <span className={styles.signEmoji}>{selectedSignData.emoji}</span>
                )}
                <div>
                  <h2 className={styles.signName}>{horoscope.sign}</h2>
                  <p className={styles.horoscopeType}>
                    {selectedType === 'daily'
                      ? t('horoscope.daily')
                      : selectedType === 'weekly'
                      ? t('horoscope.weekly')
                      : t('horoscope.monthly')}{' '}
                    Horoscope
                  </p>
                </div>
              </div>
              {horoscope.date && (
                <div className={styles.date}>{new Date(horoscope.date).toLocaleDateString()}</div>
              )}
            </div>

            {/* Main Prediction */}
            <div className={styles.predictionSection}>
              <h3 className={styles.sectionTitle}>{t('horoscope.prediction')}</h3>
              <p className={styles.predictionText}>{horoscope.prediction}</p>
            </div>

            {/* Detailed Sections */}
            <div className={styles.detailsGrid}>
              {horoscope.love && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>💕</div>
                  <h4 className={styles.detailTitle}>{t('horoscope.love')}</h4>
                  <p className={styles.detailText}>{horoscope.love}</p>
                </div>
              )}

              {horoscope.career && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>💼</div>
                  <h4 className={styles.detailTitle}>{t('horoscope.career')}</h4>
                  <p className={styles.detailText}>{horoscope.career}</p>
                </div>
              )}

              {horoscope.health && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>🏥</div>
                  <h4 className={styles.detailTitle}>{t('horoscope.health')}</h4>
                  <p className={styles.detailText}>{horoscope.health}</p>
                </div>
              )}

              {horoscope.finance && (
                <div className={styles.detailCard}>
                  <div className={styles.detailIcon}>💰</div>
                  <h4 className={styles.detailTitle}>{t('horoscope.finance')}</h4>
                  <p className={styles.detailText}>{horoscope.finance}</p>
                </div>
              )}
            </div>

            {/* Lucky Elements */}
            {(horoscope.lucky_number || horoscope.lucky_color || horoscope.compatibility) && (
              <div className={styles.luckySection}>
                <h3 className={styles.sectionTitle}>{t('horoscope.luckyElements')}</h3>
                <div className={styles.luckyItems}>
                  {horoscope.lucky_number && (
                    <div className={styles.luckyItem}>
                      <span className={styles.luckyLabel}>{t('horoscope.luckyNumber')}:</span>
                      <span className={styles.luckyValue}>{horoscope.lucky_number}</span>
                    </div>
                  )}
                  {horoscope.lucky_color && (
                    <div className={styles.luckyItem}>
                      <span className={styles.luckyLabel}>{t('horoscope.luckyColor')}:</span>
                      <span className={styles.luckyValue}>{horoscope.lucky_color}</span>
                    </div>
                  )}
                  {horoscope.compatibility && (
                    <div className={styles.luckyItem}>
                      <span className={styles.luckyLabel}>{t('horoscope.compatibility')}:</span>
                      <span className={styles.luckyValue}>{horoscope.compatibility}</span>
                    </div>
                  )}
                  {horoscope.mood && (
                    <div className={styles.luckyItem}>
                      <span className={styles.luckyLabel}>{t('horoscope.mood')}:</span>
                      <span className={styles.luckyValue}>{horoscope.mood}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HoroscopePage;
