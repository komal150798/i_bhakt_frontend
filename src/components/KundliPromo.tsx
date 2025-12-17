import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const KundliPromo: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    tob: '',
    place: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - redirect to kundli generation
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-royal-50 via-purple-50 to-gold-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-gold-200/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-200/30 to-transparent rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" data-aos="fade-up">
            <div className="lg:grid lg:grid-cols-2">
              {/* Left Side - Content */}
              <div className="bg-gradient-to-br from-royal-600 to-purple-700 p-8 sm:p-12 text-white flex flex-col justify-center">
                <div className="mb-6">
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                    <span className="text-sm font-semibold">⚡ Quick & Easy</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                    Get Your Janam Kundli in
                    <span className="block text-gold-300 mt-2">2 Minutes</span>
                  </h2>
                  <p className="text-lg text-white/90 mb-6">
                    Discover your complete astrological profile with accurate planetary positions, houses, and dasha periods. 
                    Get insights into your personality, career, relationships, and more.
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {[
                    'Accurate planetary positions',
                    'Complete house analysis',
                    'Dasha & Antardasha periods',
                    'Compatibility matching',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gold-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Side - Form */}
              <div className="p-8 sm:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="tob" className="block text-sm font-semibold text-gray-700 mb-2">
                      Time of Birth
                    </label>
                    <input
                      type="time"
                      id="tob"
                      name="tob"
                      value={formData.tob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="place" className="block text-sm font-semibold text-gray-700 mb-2">
                      Place of Birth
                    </label>
                    <input
                      type="text"
                      id="place"
                      name="place"
                      value={formData.place}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      placeholder="City, State, Country"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Kundli Now
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By continuing, you agree to our{' '}
                    <Link to="/terms" className="text-gold-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-gold-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KundliPromo;

