import { useEffect } from 'react';
import { refreshAos } from '../../../common/utils/refreshAos';
import HeroCarousel from '../../components/HeroCarousel/HeroCarousel';
import TrustStrip from '../../components/TrustStrip/TrustStrip';
import AIManifestBlock from '../../components/AIManifestBlock/AIManifestBlock';
import KundliCTA from '../../components/KundliCTA/KundliCTA';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import WhyIBhakt from '../../components/WhyIBhakt/WhyIBhakt';
import TrustSection from '../../components/TrustSection/TrustSection';
import FeatureSection from '../../components/FeatureSection/FeatureSection';
import TestimonialSection from '../../components/TestimonialSection/TestimonialSection';
import ReferBanner from '../../components/ReferBanner/ReferBanner';
import styles from './HomePage.module.css';

const SITE_URL = 'https://ibhakt.com';

function HomePage() {
  useEffect(() => {
    const desc =
      'Premium AI-powered manifestation aligned to your Vedic birth chart. Free Kundli calculator, karma tracking, and cosmic guidance.';

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'home-jsonld');
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'iBhakt',
          url: SITE_URL,
          description: desc,
        },
        {
          '@type': 'Organization',
          name: 'iBhakt',
          url: SITE_URL,
          description: 'AI manifestation and Vedic astrology platform.',
        },
      ],
    });
    document.head.appendChild(script);
    requestAnimationFrame(() => refreshAos());
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className={styles.homePage}>
      <div className={styles.heroTrust}>
        <HeroCarousel />
        <TrustStrip />
      </div>
      <AIManifestBlock />
      {/* <KundliCTA /> */}
      <HowItWorks />
      <WhyIBhakt />
      <TrustSection />
      <FeatureSection />
      <TestimonialSection />
      <ReferBanner />
    </div>
  );
}

export default HomePage;

