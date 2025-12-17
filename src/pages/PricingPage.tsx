import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import { useLanguage } from '../context/LanguageContext';

const PricingPage: React.FC = () => {
  const { t } = useLanguage();

  useEffect(() => {
    AOS.refresh();
  }, []);

  const plans = [
    {
      name: 'Awaken',
      price: 'Free',
      period: '',
      description: 'Perfect for beginners exploring spiritual insights',
      features: [
        'Basic Kundli Generation',
        'Limited Manifestation Analysis (3/month)',
        'Basic Karma Tracking (5/month)',
        'Community Support',
      ],
      highlighted: false,
      cta: 'Get Started',
    },
    {
      name: 'Karma Builder',
      price: '₹499',
      period: '/month',
      description: 'Build your karma with enhanced features',
      features: [
        'Complete Kundli with Dasha Timeline',
        'Unlimited Manifestation Analysis',
        'Advanced Karma Tracking',
        'Daily Cosmic Guidance',
        'Priority Support',
        'Unlock via Referrals (11 referrals)',
      ],
      highlighted: false,
      cta: 'Upgrade Now',
    },
    {
      name: 'Karma Pro',
      price: '₹1,999',
      period: '/month',
      description: 'Premium features for serious practitioners',
      features: [
        'Everything in Karma Builder',
        'Personalized Consultation (1/month)',
        'Advanced Manifestation Insights',
        'Detailed Karma Reports',
        'Cosmic Alignment Tips',
        '24/7 Priority Support',
      ],
      highlighted: true,
      cta: 'Choose Pro',
    },
    {
      name: 'Dharma Master',
      price: '₹4,999',
      period: '/month',
      description: 'Ultimate spiritual transformation journey',
      features: [
        'Everything in Karma Pro',
        'Unlimited Consultations',
        'VIP Personal Astrologer Access',
        'Custom Remedies & Rituals',
        'Monthly Progress Reports',
        'Dedicated Support Manager',
        'Unlock via Referrals (51 from Karma Pro)',
      ],
      highlighted: false,
      cta: 'Go Master',
    },
  ];

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        {/* Hero Section */}
        <div className="text-center mb-5" data-aos="fade-up">
          <h1 className="display-3 mb-4">Choose Your Spiritual Journey</h1>
          <p className="lead text-muted mb-5">
            Select the plan that aligns with your spiritual growth goals
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="row g-4 mb-5">
          {plans.map((plan, index) => (
            <div className="col-lg-3 col-md-6" key={plan.name} data-aos="fade-up" data-aos-delay={index * 100}>
              <div 
                className={`cosmic-card h-100 position-relative ${plan.highlighted ? 'border-gradient' : ''}`}
                style={{
                  border: plan.highlighted ? '2px solid' : '1px solid var(--card-border)',
                  borderImage: plan.highlighted ? 'linear-gradient(135deg, #7b2ff7, #4facfe, #f6c86e) 1' : undefined,
                  transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {plan.highlighted && (
                  <div className="position-absolute top-0 start-50 translate-middle">
                    <span className="badge rounded-pill px-3 py-2" style={{ background: 'var(--cosmic-gradient)', color: 'white' }}>
                      <i className="bi bi-star-fill me-1"></i>
                      Recommended
                    </span>
                  </div>
                )}

                <div className="text-center mb-4" style={{ paddingTop: plan.highlighted ? '2rem' : '0' }}>
                  <h3 className="mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="display-4 fw-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted">{plan.period}</span>}
                  </div>
                  <p className="text-muted small mb-0">{plan.description}</p>
                </div>

                <hr style={{ borderColor: 'var(--card-border)' }} />

                <ul className="list-unstyled mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="mb-3 d-flex align-items-start">
                      <i className="bi bi-check-circle-fill me-2 mt-1" style={{ color: 'var(--cosmic-purple)' }}></i>
                      <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/" 
                  className={`btn w-100 ${plan.highlighted ? 'btn-cosmic' : 'btn-cosmic-outline'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="row justify-content-center mt-5">
          <div className="col-lg-8">
            <div className="cosmic-card-glass" data-aos="fade-up">
              <h3 className="text-gradient mb-4 text-center">Frequently Asked Questions</h3>
              
              <div className="accordion" id="pricingFAQ">
                <div className="accordion-item" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--card-border)' }}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq1"
                      style={{ background: 'transparent', color: 'var(--text-primary)' }}
                    >
                      Can I upgrade or downgrade my plan?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                    <div className="accordion-body" style={{ color: 'var(--text-secondary)' }}>
                      Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                    </div>
                  </div>
                </div>

                <div className="accordion-item" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--card-border)' }}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq2"
                      style={{ background: 'transparent', color: 'var(--text-primary)' }}
                    >
                      How do referrals work?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                    <div className="accordion-body" style={{ color: 'var(--text-secondary)' }}>
                      Refer 11 friends to unlock Karma Builder plan for free, or refer 51 from Karma Pro to unlock Dharma Master.
                    </div>
                  </div>
                </div>

                <div className="accordion-item" style={{ background: 'transparent', border: 'none' }}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#faq3"
                      style={{ background: 'transparent', color: 'var(--text-primary)' }}
                    >
                      Is there a free trial?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                    <div className="accordion-body" style={{ color: 'var(--text-secondary)' }}>
                      Yes, the Awaken plan is completely free forever with basic features. You can upgrade anytime for enhanced capabilities.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;







