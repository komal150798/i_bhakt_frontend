import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Hero from '../components/Hero';
import Features from '../components/Features';
import KundliPromo from '../components/KundliPromo';
import ReferEarn from '../components/ReferEarn';

const HomePage: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <KundliPromo />
      <ReferEarn />
    </div>
  );
};

export default HomePage;

