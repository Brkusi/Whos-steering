import { useEffect } from 'react';

export default function ShippingPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ paddingTop: 120, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 10 }}>LEGAL</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, marginBottom: 8 }}>SHIPPING POLICY</div>
        <div style={{ fontSize: 12, color: 'var(--t)', marginBottom: 40, borderBottom: '1px solid var(--b)', paddingBottom: 24 }}>Last updated: June 25, 2026</div>

        <Legal h="PRODUCTION & ORDER PROCESSING">
          <p>Every Who's Steering wheel is built by hand to your exact specifications. Production begins within 24 hours of order confirmation and order processing takes place seven days a week.</p>
          <p>Standard production time is <strong style={{ color: 'var(--w)' }}>3–4 weeks</strong> from the date of order confirmation. Complex custom configurations or delays in sourcing OEM-specific components may extend this timeline. We will communicate any delays proactively.</p>
          <p>Once your build is complete, you will receive a photo of your finished wheel for approval before it ships.</p>
        </Legal>

        <Legal h="WHERE WE SHIP">
          <p>All wheels are <strong style={{ color: 'var(--w)' }}>engineered in Florida and assembled in New York City</strong>. We ship worldwide to virtually every country. If you have questions about delivery to a specific location, contact us before placing your order.</p>
        </Legal>

        <Legal h="DELIVERY TIMEFRAMES">
          <p>Once production is complete and your wheel is approved, please allow approximately <strong style={{ color: 'var(--w)' }}>3–4 business days</strong> for express worldwide tracked shipping. Domestic US orders typically arrive in 2–3 business days.</p>
          <p>All shipments include tracking information, which will be provided to you via email and viewable in your account dashboard.</p>
        </Legal>

        <Legal h="CUSTOMS, DUTIES & TAXES">
          <p>Prices listed on our website are exclusive of import duties and taxes. International customers may be subject to customs fees upon receipt of their order — these charges are determined by your local customs office and are the sole responsibility of the customer.</p>
          <p>We are not liable for delays caused by customs clearance procedures. For detailed information on expected charges, we recommend contacting your local customs office prior to ordering.</p>
        </Legal>

        <Legal h="DELAYS & UNFORESEEN CIRCUMSTANCES">
          <p>While we make every effort to ensure timely delivery, circumstances beyond our control — including customs delays, extreme weather, carrier disruptions, or global supply chain issues — may affect estimated delivery times. We appreciate your understanding and will always communicate any known delays as early as possible.</p>
        </Legal>

        <Legal h="CONTACT">
          <p>Shipping questions? Reach us at <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a></p>
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
