import { useEffect } from 'react';

export default function PaymentPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ paddingTop: 120, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 10 }}>LEGAL</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, marginBottom: 8 }}>PAYMENT POLICY</div>
        <div style={{ fontSize: 12, color: 'var(--t)', marginBottom: 40, borderBottom: '1px solid var(--b)', paddingBottom: 24 }}>Last updated: June 25, 2026</div>

        <Legal h="ACCEPTED PAYMENT METHODS">
          <p>We accept the following payment methods for all orders:</p>
          <p>• Visa, Mastercard, American Express, and Discover (credit & debit cards)</p>
          <p>• All payments are processed securely through <strong style={{ color: 'var(--w)' }}>Stripe</strong>, a PCI-DSS Level 1 certified payment processor.</p>
          <p>Your card details are handled exclusively by Stripe and are never stored on our servers. All transactions use industry-standard TLS encryption.</p>
        </Legal>

        <Legal h="PAYMENT TERMS">
          <p><strong style={{ color: 'var(--w)' }}>Full Payment Upfront</strong> — Payment in full is required at checkout to confirm your order and initiate the production process. Your build does not begin until payment is successfully processed.</p>
          <p>Upon successful payment, you will receive an order confirmation email with your order details and payment receipt. Please retain this for your records.</p>
        </Legal>

        <Legal h="PAYMENT SECURITY">
          <p>We take the security of your payment information seriously. Our site uses HTTPS encryption for all data transmission. Stripe's infrastructure is certified to PCI Service Provider Level 1 — the most stringent level of certification available in the payments industry.</p>
          <p>We never have access to your full card number, CVV, or sensitive payment credentials at any point during or after a transaction.</p>
        </Legal>

        <Legal h="ORDER CONFIRMATION">
          <p>Once payment is processed successfully, you will receive an order confirmation email. If you do not receive a confirmation within 1 hour of payment, please check your spam folder or contact us at <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a>.</p>
        </Legal>

        <Legal h="FAILED PAYMENTS">
          <p>If your payment is declined, your order will not be processed and no charge will be made. Please verify your card details and billing address before retrying. If issues persist, contact your card issuer or reach out to us for assistance.</p>
        </Legal>

        <Legal h="CURRENCY">
          <p>All prices on our website are listed in US Dollars (USD). For international customers, your bank or card issuer will handle currency conversion at their prevailing exchange rate. We are not responsible for any conversion fees charged by your financial institution.</p>
        </Legal>

        <Legal h="REFUNDS & CANCELLATIONS">
          <p>Please refer to our <a href="/refund-policy" style={{ color: 'var(--y)' }}>Return & Refund Policy</a> for full details on refunds and order cancellations.</p>
        </Legal>

        <Legal h="CONTACT">
          <p>Payment questions? Contact us at <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a></p>
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
