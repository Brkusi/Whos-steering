import { useEffect } from 'react';

export default function RefundPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ paddingTop: 120, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 10 }}>LEGAL</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, marginBottom: 8 }}>RETURN & REFUND POLICY</div>
        <div style={{ fontSize: 12, color: 'var(--t)', marginBottom: 40, borderBottom: '1px solid var(--b)', paddingBottom: 24 }}>Last updated: June 25, 2026</div>

        <div style={{ padding: '16px 20px', background: 'rgba(232,184,0,.06)', border: '1px solid rgba(232,184,0,.3)', marginBottom: 40, fontSize: 13, color: 'var(--w)', lineHeight: 1.7 }}>
          ⚠️ All Who's Steering products are <strong>custom-built to order</strong>. Because each wheel is individually crafted to your specifications, our return and refund policy reflects the nature of bespoke manufacturing.
        </div>

        <Legal h="NO RETURNS ON CUSTOM ORDERS">
          <p>Because every wheel is built specifically for you — your brand, vehicle, materials, colors, and options — <strong style={{ color: 'var(--w)' }}>we do not accept returns or exchanges on completed custom orders.</strong> This applies once production has commenced.</p>
          <p>We encourage you to review your configuration carefully before placing your order. If you have any questions about compatibility or options, please contact us before purchasing.</p>
        </Legal>

        <Legal h="CANCELLATION WINDOW">
          <p>You may cancel your order within <strong style={{ color: 'var(--w)' }}>24 hours of purchase</strong> for a full refund, provided production has not yet begun. After 24 hours, cancellations are not accepted as materials and production scheduling are committed at that point.</p>
          <p>To request a cancellation within the window, contact us immediately at <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a> with your order number.</p>
        </Legal>

        <Legal h="DEFECTS & WARRANTY">
          <p>Every Who's Steering wheel is backed by a <strong style={{ color: 'var(--w)' }}>6-month warranty</strong> against manufacturing defects. If your wheel arrives with a defect caused by our production process, we will repair or replace it at no cost to you.</p>
          <p>Warranty claims do not cover damage caused by incorrect installation, accidents, misuse, or normal wear and tear. Electrical damage resulting from failure to disconnect the vehicle battery during installation is explicitly excluded.</p>
          <p>To initiate a warranty claim, contact us with your order number, a description of the issue, and supporting photos.</p>
        </Legal>

        <Legal h="DAMAGED IN TRANSIT">
          <p>In the rare event that your wheel arrives damaged due to shipping, contact us within <strong style={{ color: 'var(--w)' }}>48 hours of delivery</strong> with photos of the damage and packaging. We will work with the carrier to file a claim and arrange a replacement.</p>
        </Legal>

        <Legal h="REFUND PROCESS">
          <p>Where a refund is approved (within the cancellation window or for a valid warranty/damage claim), it will be processed to your original payment method within <strong style={{ color: 'var(--w)' }}>14 business days</strong>. You will receive an email confirmation once the refund has been issued.</p>
        </Legal>

        <Legal h="CONTACT">
          <p>For all returns, warranty claims, or refund inquiries: <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a></p>
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
