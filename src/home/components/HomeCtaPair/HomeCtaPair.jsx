import { Link } from 'react-router-dom';
import { useLanguage } from '../../../common/i18n/LanguageContext';

const BTN_PRIMARY = 'btn btn-cosmic btn-lg rounded-pill px-4 px-md-5';
const BTN_SECONDARY = 'btn btn-cosmic-outline btn-lg rounded-pill px-4 px-md-5';

/**
 * Standard home CTAs: Start Manifestation (primary) + Explore How It Works (secondary → #how-it-works).
 */
function HomeCtaPair({ className = '', primaryClassName = BTN_PRIMARY, secondaryClassName = BTN_SECONDARY }) {
  const { t } = useLanguage();

  return (
    <div className={className}>
      <Link to="/manifestations" className={primaryClassName}>
        {t('home.ctaStartManifestation')}
      </Link>
      <a href="#how-it-works" className={secondaryClassName}>
        {t('home.ctaExploreHowItWorks')}
      </a>
    </div>
  );
}

export default HomeCtaPair;
