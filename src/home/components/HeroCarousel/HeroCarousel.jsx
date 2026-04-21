import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './HeroCarousel.module.css';

const SLIDES = [
  {
    id: 1,
    titleKey: 'home.heroTitle2',
    subtitleKey: 'home.heroSubtitle2',
    buttons: [{ labelKey: 'home.startManifesting', link: '/manifestations' }],
  },
  {
    id: 2,
    titleKey: 'home.heroTitle3',
    subtitleKey: 'home.heroSubtitle3',
    buttons: [{ labelKey: 'home.trackKarma', link: '/karma' }],
  },
];

function HeroCarousel() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [isHovered, goToNext]);

  return (
    <div
      className={styles.heroWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Indicators */}
      <div className={styles.indicators}>
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`${styles.indicator} ${index === activeIndex ? styles.indicatorActive : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.slide} ${index === activeIndex ? styles.slideActive : ''}`}
        >
          <div className="container">
            <div className="row align-items-center min-vh-100">
              <div className="col-lg-8 mx-auto text-center">
                <h1 className={`fw-bold mb-4 ${styles.title}`}>
                  {t(slide.titleKey)}
                </h1>
                <p className={`lead mb-5 ${styles.subtitle}`}>
                  {t(slide.subtitleKey)}
                </p>
                <div className={styles.ctaRow}>
                  {slide.buttons.map((button, btnIndex) => (
                    <Link
                      key={btnIndex}
                      to={button.link}
                      className="btn btn-cosmic btn-lg rounded-pill px-5"
                    >
                      {t(button.labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button className={styles.controlPrev} type="button" onClick={goToPrev} aria-label="Previous">
        <i className="bi bi-chevron-left"></i>
      </button>
      <button className={styles.controlNext} type="button" onClick={goToNext} aria-label="Next">
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
}

export default HeroCarousel;
