import React, { useEffect } from 'react';
import AOS from 'aos';

const PricingPolicyPage: React.FC = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="page-hero-heading fw-bold mb-4">Pricing Policy</h1>
              <p className="lead page-hero-subtitle">
                How <span className="brand-mark">iBhakt</span> displays prices, taxes, and plan types for our spiritual-tech
                platform.
              </p>
              <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="cosmic-card" data-aos="fade-up">
              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">1. Scope</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  This Pricing Policy describes how we present and bill for iBhakt services—including free and paid tiers,
                  optional upgrades, and digital add-ons. The exact price, currency, and line items shown at checkout or
                  in your account at the time of purchase prevail if they differ from marketing copy on the site.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">2. Plans and positioning</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  iBhakt is structured around progressive access to Kundli tools, manifestation features, karma tracking,
                  and guidance. Marketing names for paid tiers may include <strong style={{ color: 'var(--text-color)' }}>Karma Builder</strong>,{' '}
                  <strong style={{ color: 'var(--text-color)' }}>Karma Pro</strong>, and <strong style={{ color: 'var(--text-color)' }}>Dharma Master</strong>, alongside a free{' '}
                  <strong style={{ color: 'var(--text-color)' }}>Awaken</strong> experience where we offer it. Features and
                  limits per plan are described in the app and on our pricing or upgrade screens and may evolve as we ship
                  improvements.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">3. Currency and taxes</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Prices are generally quoted in <strong style={{ color: 'var(--text-color)' }}>Indian Rupees (INR)</strong>{' '}
                  for customers in India. Applicable taxes—including GST where required—are calculated at checkout based on
                  billing details and current regulations. Your payment receipt or invoice will show tax breakdown when
                  issued by our payment partner or iBhakt as applicable.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">4. Payment methods</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We use trusted payment processors. Available methods (cards, UPI, net banking, wallets, etc.) depend on
                  your region and the integration shown at payment time. iBhakt does not store your full card number on our
                  servers.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">5. Price changes</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We may change list prices or bundle features. When we change recurring subscription prices, we aim to
                  give reasonable notice (for example by email or in-app message) before the change affects your next
                  renewal. Continuing after notice usually means you accept the new price for subsequent renewal cycles.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">6. Promotions and referrals</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Limited-time offers, referral unlocks, or partner promotions may modify price or access. Each promotion
                  has its own rules and expiry; conflicting terms are resolved in favor of the specific promotion text
                  shown when you accept it.
                </p>
              </section>

              <section>
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">7. Questions</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  For billing or pricing questions, write to{' '}
                  <a href="mailto:support@ibhakt.com" className="text-decoration-none" style={{ color: 'var(--primary-color)' }}>
                    support@ibhakt.com
                  </a>{' '}
                  or use the Contact page on this site. For legal terms governing use of the platform, see our Terms of
                  Use.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPolicyPage;
