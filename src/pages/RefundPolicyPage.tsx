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
              <h1 className="display-3 mb-4">Refund & Cancellation Policy</h1>
              <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="cosmic-card" data-aos="fade-up">
              <section className="mb-5">
                <h2 className="text-gradient mb-3">1. Refund Eligibility</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Refunds may be issued under the following circumstances:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Service not delivered due to technical errors on our part</li>
                  <li>Duplicate payment made by mistake</li>
                  <li>Subscription cancelled within 7 days of purchase (if eligible)</li>
                  <li>Service cancellation before service delivery</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">2. Non-Refundable Services</h2>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>One-time Kundli generation (once delivered)</li>
                  <li>Manifestation analysis reports (once generated)</li>
                  <li>Subscriptions after 7 days of purchase</li>
                  <li>Services already consumed or delivered</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">3. Cancellation Process</h2>
                <h5 className="mb-2">Subscription Cancellation</h5>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  You can cancel your subscription at any time through your account settings. Cancellation will take 
                  effect at the end of your current billing period. You will continue to have access until the period ends.
                </p>

                <h5 className="mb-2 mt-4">Service Cancellation</h5>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  To cancel a scheduled service, contact us at least 24 hours before the scheduled time. Cancellation 
                  requests received later may not be eligible for refund.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">4. Refund Processing</h2>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Refund requests must be submitted via email or account dashboard</li>
                  <li>Processing time: 5-10 business days</li>
                  <li>Refunds will be issued to the original payment method</li>
                  <li>Bank transfer refunds may take additional 3-5 business days</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">5. Partial Refunds</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  In cases where services are partially delivered, we may issue partial refunds based on:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Percentage of service completed</li>
                  <li>Technical limitations preventing full delivery</li>
                  <li>Mutual agreement between user and iBhakt</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">6. Chargebacks</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  If you initiate a chargeback without first contacting us, your account may be suspended. Please 
                  contact our support team to resolve any billing issues before disputing charges.
                </p>
              </section>

              <section>
                <h2 className="text-gradient mb-3">7. Contact for Refunds</h2>
                <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="mb-1"><strong>Email:</strong> refunds@ibhakt.com</p>
                  <p className="mb-1"><strong>Phone:</strong> +91 123 456 7890</p>
                  <p className="mb-0"><strong>Response Time:</strong> Within 24-48 hours</p>
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







