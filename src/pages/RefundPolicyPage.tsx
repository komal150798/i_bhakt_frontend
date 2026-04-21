import React, { useEffect } from 'react';
import AOS from 'aos';

const RefundPolicyPage: React.FC = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="page-hero-heading fw-bold mb-4">Refund &amp; Cancellation Policy</h1>
              <p className="lead page-hero-subtitle">
                How refunds, cancellations, and billing work for iBhakt subscriptions and paid features.
              </p>
              <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="cosmic-card" data-aos="fade-up">
              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">1. About iBhakt</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  <span className="brand-mark">iBhakt</span> is a digital platform for Vedic-aligned tools—including Kundli
                  generation, AI-assisted manifestation sessions, karma logging, and related insights. This policy applies
                  to fees paid through the iBhakt website or app for subscriptions and one-time or add-on digital
                  services, subject to the law and the terms shown at checkout.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">2. When a refund may be considered</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>We may approve a refund or account credit when:</p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>A payment succeeded but the paid feature did not activate due to a verified technical fault on our side.</li>
                  <li>You were charged twice for the same transaction (duplicate charge).</li>
                  <li>Required by applicable consumer law in your jurisdiction.</li>
                </ul>
                <p className="mt-3 mb-0" style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Free features (including the Awaken tier where offered) are not billed; there is nothing to refund for
                  those portions of the product.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">3. Generally non-refundable</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>Typically no refund is due for:</p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Digital goods or reports already delivered or downloaded (e.g. detailed chart outputs once generated).</li>
                  <li>Subscription time already elapsed, or usage-based credits already consumed.</li>
                  <li>Change of mind after purchase, unless mandatory cooling-off rights apply.</li>
                  <li>Incorrect birth data or other information supplied by you that affects results—please verify inputs before paying for premium outputs.</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">4. Cancelling a subscription</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  You can cancel a paid subscription from your account or billing settings where available. Cancellation
                  usually stops renewal at the end of the current billing period; you keep access until that date unless
                  we state otherwise in-product. No refund is owed for the portion of the period already started, except
                  where law requires a different treatment.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">5. How to request a refund</h2>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Email <strong style={{ color: 'var(--text-color)' }}>support@ibhakt.com</strong> with your registered email, date of charge, and invoice or transaction reference if you have one.</li>
                  <li>Describe the issue in one thread so we can trace it quickly.</li>
                  <li>Approved refunds are sent to the original payment method where technically possible; timing depends on banks and payment partners (often several business days).</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">6. Chargebacks</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Please contact us before initiating a payment dispute so we can correct a genuine billing error. Abuse
                  of chargebacks may lead to suspension of access to protect the platform and other users.
                </p>
              </section>

              <section>
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">7. Contact</h2>
                <div
                  className="p-3 rounded"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-color)' }}
                >
                  <p className="mb-1" style={{ color: 'var(--text-color)' }}>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:support@ibhakt.com" className="text-decoration-none" style={{ color: 'var(--primary-color)' }}>
                      support@ibhakt.com
                    </a>
                  </p>
                  <p className="mb-1" style={{ color: 'var(--text-color)' }}>
                    <strong>Phone:</strong>{' '}
                    <a href="tel:+919767149042" className="text-decoration-none" style={{ color: 'var(--primary-color)' }}>
                      +91 97671 49042
                    </a>
                  </p>
                  <p className="mb-0 small" style={{ color: 'var(--text-secondary)' }}>
                    Jagruti Colony, Narendra Nagar, Nagpur, Maharashtra 440015, India
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

export default RefundPolicyPage;
