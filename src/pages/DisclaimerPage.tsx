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
              <h1 className="page-hero-heading fw-bold mb-4">Disclaimer</h1>
              <p className="lead page-hero-subtitle">
                Important limitations on how to use <span className="brand-mark">iBhakt</span>—astrology-inspired software,
                not a substitute for professional judgment.
              </p>
              <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="cosmic-card" data-aos="fade-up">
              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">1. Nature of the service</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  iBhakt provides software-based experiences grounded in classical Vedic chart logic, user-provided birth
                  data, and—where indicated—AI-assisted language and suggestions. Outputs are intended for{' '}
                  <strong style={{ color: 'var(--text-color)' }}>reflection, education, and spiritual exploration</strong>,
                  not as commands or guarantees about the future.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">2. Not professional advice</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Nothing on iBhakt is medical, legal, financial, or psychological advice. Do not delay or disregard
                  professional care because of something you read in a chart, manifestation summary, or karma insight.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">3. AI and software limitations</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Where features use AI, responses may be incomplete, approximate, or unsuitable for your situation. Models
                  do not “know” you the way a human practitioner can. Automated text may occasionally be inaccurate or
                  misphrased; always cross-check important life decisions with qualified people you trust.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">4. Chart accuracy and inputs</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Kundli and timing calculations depend on the accuracy of date, time, and place of birth you enter, the
                  ephemeris and rules we implement, and interpretive choices common in Jyotish traditions. Different
                  schools or human astrologers may reasonably disagree; iBhakt cannot represent every tradition at once.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">5. No outcome guarantees</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We do not promise results from rituals, intentions, karma logs, or any guidance shown in the app.
                  Individual effort, context, and factors outside our control always apply.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">6. Third parties</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Links, logins, or payments may involve third-party sites or processors. Their terms and privacy policies
                  govern those interactions. iBhakt is not responsible for content on external websites.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">7. Availability</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  The platform may be unavailable during maintenance or outages. We strive for reliability but do not
                  warrant uninterrupted access.
                </p>
              </section>

              <section>
                <div
                  className="alert alert-warning"
                  role="alert"
                  style={{
                    background: 'rgba(201, 168, 76, 0.1)',
                    borderColor: 'rgba(201, 168, 76, 0.45)',
                    color: 'var(--text-color)',
                  }}
                >
                  <h5 className="alert-heading legal-subhead">
                    <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: 'var(--primary-color)' }}></i>
                    Your responsibility
                  </h5>
                  <p className="mb-0" style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    By using iBhakt you confirm you have read this disclaimer and our Terms of Use. You use the product at
                    your own discretion and remain responsible for decisions you make in real life.
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
