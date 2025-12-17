import React from 'react';
import { Link } from 'react-router-dom';

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  link: string;
}

const features: Feature[] = [
  {
    icon: '⭐',
    title: 'Free Kundli',
    description: 'Generate your complete birth chart with detailed planetary positions and houses',
    gradient: 'from-gold-400 to-gold-600',
    link: '/',
  },
  {
    icon: '📅',
    title: 'Horoscope',
    description: 'Get daily, weekly, and monthly predictions based on your zodiac sign',
    gradient: 'from-royal-400 to-royal-600',
    link: '/',
  },
  {
    icon: '💑',
    title: 'Matchmaking',
    description: 'Check compatibility with your partner using advanced astrological matching',
    gradient: 'from-purple-400 to-purple-600',
    link: '/',
  },
  {
    icon: '🃏',
    title: 'Tarot Reading',
    description: 'Get insights into your future through mystical tarot card readings',
    gradient: 'from-gold-400 to-gold-600',
    link: '/',
  },
  {
    icon: '🔢',
    title: 'Numerology',
    description: 'Discover your life path number and unlock hidden meanings in numbers',
    gradient: 'from-royal-400 to-royal-600',
    link: '/',
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="bg-gradient-to-r from-gold-500 to-gold-700 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of astrological services designed to guide you on your spiritual journey
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gold-600 group-hover:to-royal-600 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow Icon */}
                <div className="mt-6 flex items-center text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-semibold mr-2">Learn More</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

