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
              <h1 className="display-3 mb-4">Pricing Policy</h1>
              <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="cosmic-card" data-aos="fade-up">
              <section className="mb-5">
                <h2 className="text-gradient mb-3">1. Pricing Structure</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  iBhakt offers multiple subscription plans and one-time service options. All prices are displayed 
                  in INR (Indian Rupees) and may be subject to applicable taxes.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">2. Subscription Plans</h2>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li><strong>Awaken Plan:</strong> Free tier with limited features</li>
                  <li><strong>Karma Builder:</strong> Basic paid plan with enhanced features</li>
                  <li><strong>Karma Pro:</strong> Advanced plan with premium features</li>
                  <li><strong>Dharma Master:</strong> Premium plan with unlimited access</li>
                </ul>
                <p className="mt-3" style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Plan features and pricing are subject to change. Current users will be notified 30 days before 
                  any price changes to their active plan.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">3. One-Time Services</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Individual services such as detailed Kundli reports, manifestation analysis, and personalized 
                  consultations are available as one-time purchases at fixed prices displayed on our platform.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">4. Payment Methods</h2>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Credit/Debit Cards</li>
                  <li>UPI (Unified Payments Interface)</li>
                  <li>Net Banking</li>
                  <li>Digital Wallets (Paytm, PhonePe, etc.)</li>
                  <li>Bank Transfer (for bulk orders)</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">5. Pricing Changes</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We reserve the right to modify pricing at any time. Changes will be:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Communicated via email to affected users</li>
                  <li>Displayed prominently on our platform</li>
                  <li>Effective for new purchases immediately</li>
                  <li>Applied to renewals after current billing period</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">6. Taxes</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  All prices exclude applicable taxes (GST, VAT, etc.). Taxes will be calculated and added during 
                  checkout based on your location and applicable tax laws.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">7. Currency</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  All transactions are processed in INR. If you pay in a different currency, conversion rates will 
                  be applied by your payment provider, and we are not responsible for exchange rate fluctuations.
                </p>
              </section>

              <section>
                <h2 className="text-gradient mb-3">8. Contact</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  For pricing inquiries, contact us:
                </p>
                <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="mb-1"><strong>Email:</strong> pricing@ibhakt.com</p>
                  <p className="mb-0"><strong>Phone:</strong> +91 123 456 7890</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPolicyPage;







