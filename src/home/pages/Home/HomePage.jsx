import HeroCarousel from '../../components/HeroCarousel/HeroCarousel';
import FeatureSection from '../../components/FeatureSection/FeatureSection';
import KundliForm from '../../components/KundliForm/KundliForm';
import ReferBanner from '../../components/ReferBanner/ReferBanner';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.homePage}>
      <HeroCarousel />
      <FeatureSection />
      <KundliForm />
      <ReferBanner />
    </div>
  );
}

export default HomePage;

