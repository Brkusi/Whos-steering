import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ paddingTop: 120, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 10 }}>LEGAL</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, marginBottom: 8 }}>PRIVACY POLICY</div>
        <div style={{ fontSize: 12, color: 'var(--t)', marginBottom: 40, borderBottom: '1px solid var(--b)', paddingBottom: 24 }}>Last updated: June 25, 2026</div>

        <Legal h="OVERVIEW">
          <p>This Privacy Policy describes how Who's Steering ("we", "us", "our") at whossteering.com collects, uses, and discloses your Personal Information when you visit or make a purchase from our site.</p>
          <p>For questions, contact us at <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a></p>
        </Legal>

        <Legal h="INFORMATION WE COLLECT">
          <p><strong style={{ color: 'var(--w)' }}>Device & Usage Information</strong> — Collected automatically when you access our site: browser version, IP address, time zone, pages viewed, and how you interact with the site. Used to optimize site performance and user experience.</p>
          <p><strong style={{ color: 'var(--w)' }}>Order Information</strong> — Collected directly from you at checkout: name, email address, phone number, shipping address, and payment information. Used to process and fulfill your order, communicate with you, and detect fraud.</p>
          <p><strong style={{ color: 'var(--w)' }}>Customer Support Information</strong> — Any information you provide when contacting us for support, including wheel photos or vehicle details needed for production.</p>
          <p><strong style={{ color: 'var(--w)' }}>Wheel Photos</strong> — If required for fitment verification, photos you upload of your current steering wheel components are used solely for manufacturing purposes and are not shared with third parties.</p>
        </Legal>

        <Legal h="HOW WE USE YOUR INFORMATION">
          <p>We use your information to: process and fulfill orders, send order confirmations and shipping updates, provide customer support, detect and prevent fraud, and improve our website and services.</p>
          <p>We do not sell your personal information to third parties for marketing purposes.</p>
        </Legal>

        <Legal h="SHARING YOUR INFORMATION">
          <p>We share your information only with service providers necessary to operate our business:</p>
          <p><strong style={{ color: 'var(--w)' }}>Stripe</strong> — Payment processing. Your card details are handled entirely by Stripe and never stored on our servers. See Stripe's privacy policy at stripe.com/privacy.</p>
          <p><strong style={{ color: 'var(--w)' }}>Shipping Carriers</strong> — Name and shipping address shared with carriers (UPS, FedEx, DHL, USPS) to fulfill delivery.</p>
          <p>We may also disclose your information if required by law or to protect our legal rights.</p>
        </Legal>

        <Legal h="DATA RETENTION">
          <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, including fulfilling orders, resolving disputes, and complying with legal obligations. You may request deletion of your data by contacting us directly.</p>
        </Legal>

        <Legal h="YOUR RIGHTS">
          <p>Depending on your location, you may have the right to: access the personal information we hold about you, correct inaccurate data, request deletion of your data, and opt out of certain data uses.</p>
          <p><strong style={{ color: 'var(--w)' }}>California Residents (CCPA)</strong> — You have the right to know what personal information is collected, request deletion, and opt out of any sale of personal information.</p>
          <p><strong style={{ color: 'var(--w)' }}>EU/EEA Residents (GDPR)</strong> — You have the right to access, port, correct, and erase your personal data. To exercise these rights, contact us at <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a>.</p>
        </Legal>

        <Legal h="MINORS">
          <p>Our site is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with their information, please contact us immediately.</p>
        </Legal>

        <Legal h="COOKIES & TRACKING">
          <p>We use cookies and similar technologies to improve your browsing experience and analyze site traffic. You can control cookie settings through your browser. Note that disabling cookies may affect certain site functionality.</p>
          <p>We do not alter our data practices in response to "Do Not Track" browser signals, as there is no consistent industry standard for handling such signals.</p>
        </Legal>

        <Legal h="CHANGES TO THIS POLICY">
          <p>We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use of the Service after changes constitutes acceptance.</p>
        </Legal>

        <Legal h="CONTACT">
          <p>For privacy-related questions or requests: <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a></p>
        </Legal>
      </div>
    </div>
  );
}

function Legal({ h, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', textTransform: 'uppercase', marginBottom: 12 }}>{h}</div>
      <div style={{ fontSize: 14, color: 'var(--t)', lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}
