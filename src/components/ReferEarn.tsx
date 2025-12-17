import React from 'react';
import { Link } from 'react-router-dom';

const ReferEarn: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 relative overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-stars"></div>
      </div>

      {/* Animated Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{ animationDelay: '0.7s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl" data-aos="zoom-in">
            <div className="text-center text-white">
              {/* Icon */}
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-4 mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Refer Friends & Earn Rewards
              </h2>

              {/* Description */}
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Share the gift of astrology with your friends and earn exciting rewards. 
                For every successful referral, you both get special benefits!
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: '🎁', text: 'Rewards for You' },
                  { icon: '🎉', text: 'Benefits for Friends' },
                  { icon: '💰', text: 'Unlimited Earnings' },
                ].map((benefit, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl mb-2">{benefit.icon}</div>
                    <div className="text-sm font-semibold">{benefit.text}</div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                to="/refer"
                className="inline-block bg-white text-gold-700 font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Invite Now
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferEarn;

