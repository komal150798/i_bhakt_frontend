import HeroCarousel from '../../components/HeroCarousel/HeroCarousel';
import FeatureSection from '../../components/FeatureSection/FeatureSection';
import ReferBanner from '../../components/ReferBanner/ReferBanner';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.homePage}>
      <HeroCarousel />
      <FeatureSection />
      <ReferBanner />
    </div>
  );
}

export default HomePage;

