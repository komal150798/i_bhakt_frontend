import React, { useEffect } from 'react';
import AOS from 'aos';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="cosmic-bg" style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5" data-aos="fade-up">
              <h1 className="display-3 mb-4">Privacy Policy</h1>
              <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="cosmic-card" data-aos="fade-up">
              <section className="mb-5">
                <h2 className="text-gradient mb-3">1. Introduction</h2>
                <p className="mb-3" style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  iBhakt ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
                  how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">2. Information We Collect</h2>
                <h5 className="mb-2">Personal Information</h5>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Name, email address, phone number</li>
                  <li>Date, time, and place of birth (for Kundli generation)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Account credentials and preferences</li>
                </ul>

                <h5 className="mb-2 mt-4">Usage Information</h5>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Interactions with our services</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">3. How We Use Your Information</h2>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>To generate and provide astrological services (Kundli, Manifestation analysis)</li>
                  <li>To process transactions and manage your account</li>
                  <li>To send you service-related notifications</li>
                  <li>To improve our platform and develop new features</li>
                  <li>To comply with legal obligations</li>
                  <li>To prevent fraud and ensure security</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">4. Data Security</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We implement industry-standard security measures to protect your personal information, including:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication mechanisms</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and employee training</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">5. Data Sharing</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We do not sell your personal information. We may share data with:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Service providers who assist in platform operations</li>
                  <li>Payment processors for transaction handling</li>
                  <li>Legal authorities when required by law</li>
                  <li>Business partners with your explicit consent</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">6. Your Rights</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  You have the right to:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">7. Cookies and Tracking</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We use cookies and similar technologies to enhance your experience, analyze usage, and personalize 
                  content. You can control cookies through your browser settings.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">8. Children's Privacy</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  Our services are not intended for children under 18. We do not knowingly collect information from 
                  children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              <section className="mb-5">
                <h2 className="text-gradient mb-3">9. Changes to This Policy</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes via 
                  email or platform notification. Your continued use after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-gradient mb-3">10. Contact Us</h2>
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <div className="p-3 rounded" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="mb-1"><strong>Email:</strong> privacy@ibhakt.com</p>
                  <p className="mb-1"><strong>Phone:</strong> +91 123 456 7890</p>
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

export default PrivacyPolicyPage;







