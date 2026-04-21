import { useEffect } from 'react';
import AOS from 'aos';
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
    document.title = 'iBhakt — AI Manifestation & Vedic Kundli Platform';
    const desc =
      'Premium AI-powered manifestation aligned to your Vedic birth chart. Free Kundli calculator, karma tracking, and cosmic guidance.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

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
    requestAnimationFrame(() => AOS.refresh());
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

