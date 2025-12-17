import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './HeroCarousel.module.css';

function HeroCarousel() {
  const { t } = useLanguage();

  const SLIDES = [
    {
      id: 1,
      titleKey: 'home.heroTitle',
      subtitleKey: 'home.heroSubtitle',
      buttons: [
        { labelKey: 'home.generateKundli', variant: 'primary' },
        { labelKey: 'home.talkToAstrologer', variant: 'outline-accent' },
      ],
    },
    {
      id: 2,
      titleKey: 'home.heroTitle2',
      subtitleKey: 'home.heroSubtitle2',
      buttons: [{ labelKey: 'home.viewHoroscope', variant: 'primary' }],
    },
    {
      id: 3,
      titleKey: 'home.heroTitle3',
      subtitleKey: 'home.heroSubtitle3',
      buttons: [{ labelKey: 'home.checkCompatibility', variant: 'primary' }],
    },
  ];

  return (
    <div
      id="heroCarousel"
      className="carousel slide carousel-fade"
      data-bs-ride="carousel"
      data-bs-interval="5000"
    >
      <div className="carousel-indicators">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
            aria-current={index === 0 ? 'true' : undefined}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="carousel-inner">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-item ${index === 0 ? 'active' : ''}`}
          >
            <div className={styles.slide}>
              <div className="container">
                <div className="row align-items-center min-vh-100">
                  <div className="col-lg-8 mx-auto text-center">
                    <h1 className={`display-3 fw-bold mb-4 ${styles.title}`}>
                      {t(slide.titleKey)}
                    </h1>
                    <p className={`lead mb-5 ${styles.subtitle}`}>
                      {t(slide.subtitleKey)}
                    </p>
                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                      {slide.buttons.map((button, btnIndex) => (
                        <button
                          key={btnIndex}
                          className={`btn btn-${button.variant === 'primary' ? 'primary' : 'outline-primary'} btn-lg rounded-pill px-5`}
                        >
                          {t(button.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#heroCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default HeroCarousel;
