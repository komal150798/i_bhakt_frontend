import { Link } from 'react-router-dom';
import styles from './FeatureCards.module.css';

const FEATURES = [
  {
    id: 1,
    icon: '🔯',
    title: 'Free Kundli',
    description: 'Generate your complete birth chart with accurate planetary positions and houses.',
    link: '/kundli',
  },
  {
    id: 2,
    icon: '📅',
    title: 'Daily Horoscope',
    description: 'Get daily, weekly, and monthly predictions tailored to your zodiac sign.',
    link: '/horoscope',
  },
  {
    id: 3,
    icon: '💑',
    title: 'Matchmaking',
    description: 'Check compatibility with your partner using advanced astrological matching.',
    link: '/matchmaking',
  },
  {
    id: 4,
    icon: '🔮',
    title: 'Tarot Reading',
    description: 'Get insights into your future through mystical tarot card readings.',
    link: '/tarot',
  },
];

function FeatureCards() {
  return (
    <section className={styles.features}>
      <div className="container py-5">
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <h2 className="display-5 fw-bold mb-3">Our Services</h2>
            <p className="lead text-muted">
              Comprehensive astrological services to guide your life journey
            </p>
          </div>
        </div>

        <div className="row g-4">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="col-md-6 col-lg-3">
              <Link to={feature.link} className={styles.cardLink}>
                <div className={`card h-100 ${styles.featureCard}`}>
                  <div className="card-body text-center p-4">
                    <div className={styles.icon}>{feature.icon}</div>
                    <h5 className="card-title fw-bold mb-3">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;

