import HeroCarousel from '../../../components/user/HeroCarousel/HeroCarousel';
import FeatureCards from '../../../components/user/FeatureCards/FeatureCards';
import KundliForm from '../../../components/user/KundliForm/KundliForm';
import ReferBanner from '../../../components/user/ReferBanner/ReferBanner';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.homePage}>
      <HeroCarousel />
      <FeatureCards />
      <KundliForm />
      <ReferBanner />
    </div>
  );
}

export default HomePage;

