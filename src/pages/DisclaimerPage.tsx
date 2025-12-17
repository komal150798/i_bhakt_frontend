import React, { useEffect } from 'react';
import AOS from 'aos';

const DisclaimerPage: React.FC = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="display-3 mb-4">Disclaimer</h1>
              <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="cosmic-card" data-aos="fade-up">
              <section className="mb-5">
                <h2 className="text-gradient mb-3">1. Nature of Services</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  iBhakt provides astrological services, spiritual guidance, and manifestation tools based on 
                  traditional Vedic astrology principles. Our services are intended for:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Entertainment and personal reflection</li>
                  <li>Spiritual guidance and self-awareness</li>
                  <li>Cultural and traditional reference</li>
                  <li>Complementary insights to your decision-making process</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">2. Not Professional Advice</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  <strong>Important:</strong> Astrological readings and guidance provided by iBhakt are not substitutes 
                  for professional advice. You should NOT:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Make medical decisions based on astrological information</li>
                  <li>Make financial investments solely on astrological predictions</li>
                  <li>Make legal decisions without consulting qualified professionals</li>
                  <li>Ignore professional medical, legal, or financial advice</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">3. No Guarantees</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We do not guarantee:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Accuracy of astrological predictions or outcomes</li>
                  <li>Results from following our guidance or recommendations</li>
                  <li>Manifestation of desires based on our analysis</li>
                  <li>Any specific outcomes from using our services</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">4. Personal Responsibility</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  You are solely responsible for:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Decisions made based on our services</li>
                  <li>Actions taken after receiving guidance</li>
                  <li>Interpreting astrological information</li>
                  <li>Seeking appropriate professional advice when needed</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">5. Calculation Accuracy</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  While we use established Vedic astrology calculations and algorithms, results depend on:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Accuracy of birth details provided by you</li>
                  <li>Different schools of thought in astrology</li>
                  <li>Interpretation methods and traditions</li>
                  <li>Complexity of astrological calculations</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">6. Third-Party Services</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Our platform may contain links to third-party services or websites. We are not responsible for:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Content or accuracy of third-party websites</li>
                  <li>Services provided by third parties</li>
                  <li>Privacy practices of external sites</li>
                  <li>Any issues arising from third-party interactions</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">7. Technology Limitations</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  While we strive for accuracy, our platform:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>May experience technical interruptions</li>
                  <li>Uses automated calculations that may have limitations</li>
                  <li>Cannot account for all variables in astrological analysis</li>
                  <li>May require periodic updates and maintenance</li>
                </ul>
              </section>

              <section>
                <div className="alert alert-warning" role="alert" style={{ background: 'rgba(246, 200, 110, 0.1)', borderColor: '#f6c86e' }}>
                  <h5 className="alert-heading">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Final Notice
                  </h5>
                  <p className="mb-0" style={{ lineHeight: '1.8' }}>
                    By using iBhakt services, you acknowledge that you have read, understood, and agree to this 
                    disclaimer. Use our services at your own discretion and judgment.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;







