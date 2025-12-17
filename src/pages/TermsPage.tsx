import React, { useEffect } from 'react';
import AOS from 'aos';

const TermsPage: React.FC = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="display-3 mb-4">Terms & Conditions</h1>
              <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="cosmic-card" data-aos="fade-up">
              <section className="mb-5">
                <h2 className="text-gradient mb-3">1. Acceptance of Terms</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  By accessing and using iBhakt, you accept and agree to be bound by these Terms and Conditions. 
                  If you do not agree, please do not use our services.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">2. Services</h2>
                <p className="mb-3" style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  iBhakt provides astrological services including:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Kundli generation and analysis</li>
                  <li>Manifestation resonance measurement</li>
                  <li>Karma tracking and scoring</li>
                  <li>Cosmic guidance and personalized insights</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">3. User Accounts</h2>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You must not share your account credentials</li>
                  <li>You are responsible for all activities under your account</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">4. Payment Terms</h2>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Subscription fees are billed according to selected plan</li>
                  <li>Payments are processed through secure third-party providers</li>
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>We reserve the right to change pricing with notice</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">5. Intellectual Property</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  All content on iBhakt, including text, graphics, logos, and software, is the property of iBhakt 
                  or its licensors and is protected by copyright and trademark laws. You may not reproduce, distribute, 
                  or create derivative works without permission.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">6. Prohibited Uses</h2>
                <p className="mb-2" style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  You agree not to:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Use the service for illegal purposes</li>
                  <li>Attempt to hack or compromise platform security</li>
                  <li>Copy or resell our services</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Interfere with platform functionality</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">7. Disclaimer</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Astrological services are for entertainment and guidance purposes only. Results are not guaranteed, 
                  and you should not base important life decisions solely on astrological information. Consult qualified 
                  professionals for medical, legal, or financial advice.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">8. Limitation of Liability</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  iBhakt shall not be liable for any indirect, incidental, special, or consequential damages arising 
                  from use of our services. Our total liability shall not exceed the amount paid by you in the past 12 months.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">9. Termination</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We reserve the right to suspend or terminate your account if you violate these terms. You may cancel 
                  your subscription at any time through your account settings.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">10. Changes to Terms</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We may update these Terms and Conditions from time to time. Continued use after changes constitutes 
                  acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-gradient mb-3">11. Contact Information</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  For questions about these Terms, contact us:
                </p>
                <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="mb-1"><strong>Email:</strong> legal@ibhakt.com</p>
                  <p className="mb-0"><strong>Address:</strong> 123 Spiritual Street, Mumbai, Maharashtra 400001</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;







