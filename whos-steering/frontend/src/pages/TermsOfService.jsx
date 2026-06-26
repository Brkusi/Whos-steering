import { useEffect } from 'react';

export default function TermsOfService() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ paddingTop: 120, minHeight: '100vh', background: 'var(--d)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: 'var(--y)', marginBottom: 10 }}>LEGAL</div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 52, marginBottom: 8 }}>TERMS OF SERVICE</div>
        <div style={{ fontSize: 12, color: 'var(--t)', marginBottom: 40, borderBottom: '1px solid var(--b)', paddingBottom: 24 }}>Last updated: June 25, 2026</div>

        <Legal h="INTERPRETATION AND DEFINITIONS">
          <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          <Def term="Company">"Who's Steering" (referred to as "the Company", "We", "Us", or "Our") — a custom steering wheel manufacturer and retailer operating in the United States.</Def>
          <Def term="Website">whossteering.com</Def>
          <Def term="Service">The Website and all products offered through it.</Def>
          <Def term="Goods">Custom-built steering wheels and related accessories offered for sale.</Def>
          <Def term="Orders">A request by You to purchase Goods from Us.</Def>
          <Def term="You">The individual or entity accessing or using the Service.</Def>
          <Def term="Country">United States of America</Def>
        </Legal>

        <Legal h="ACKNOWLEDGMENT">
          <p>These Terms govern your use of the Service and the agreement between You and the Company. By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part, you may not access the Service.</p>
          <p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>
          <p><strong>Important:</strong> You acknowledge that any damage incurred to you or your vehicle due to incorrect installation methods is not our responsibility. You must disconnect your vehicle's battery prior to working with any electrical components, including steering wheel replacement.</p>
        </Legal>

        <Legal h="PLACING ORDERS">
          <p>By placing an Order through the Service, you warrant that you are legally capable of entering into binding contracts and that all information you provide is true, correct, and complete.</p>
          <p>We reserve the right to refuse or cancel any Order at any time due to goods availability, pricing errors, errors in your Order, or suspicion of fraud or unauthorized transactions.</p>
        </Legal>

        <Legal h="CUSTOM & MADE-TO-ORDER GOODS">
          <p>All steering wheels are custom-built to your exact specifications. As such, <strong>you do not have the right to cancel an Order once production has commenced.</strong> Custom-made goods that are built to your specifications are non-returnable and non-refundable once manufacturing begins.</p>
          <p>If we require images of specific parts of your current steering wheel (such as airbag or core photos) for fitment verification, they must be provided to us promptly for manufacturing to continue. This is required to ensure safety and compatibility with your specific vehicle model.</p>
        </Legal>

        <Legal h="PRICES & PAYMENTS">
          <p>All prices listed are in USD. The Company reserves the right to revise prices at any time prior to accepting an Order. Payment is processed securely through Stripe. We accept Visa, MasterCard, American Express, and Discover.</p>
          <p>Payment in full is required at checkout to confirm and initiate production. Your payment details are never stored by us — all transactions are handled by Stripe's PCI-compliant infrastructure.</p>
        </Legal>

        <Legal h="PRODUCTION & DELIVERY">
          <p>All wheels are manufactured in Florida and assembled in New York City. Production typically spans 3–4 weeks from order confirmation, though complex custom configurations may take longer. You will receive a photo of the completed wheel for verification before it ships.</p>
          <p>We ship worldwide. International customers are responsible for all import duties, taxes, and customs fees levied by their local customs authority. We are not responsible for delays caused by customs clearance.</p>
        </Legal>

        <Legal h="LIMITATION OF LIABILITY">
          <p>To the maximum extent permitted by applicable law, the Company's total liability shall be limited to the amount actually paid by You through the Service. In no event shall the Company be liable for any special, incidental, indirect, or consequential damages whatsoever.</p>
        </Legal>

        <Legal h="GOVERNING LAW">
          <p>These Terms shall be governed by the laws of the State of New York, United States, without regard to its conflict of law provisions. Any disputes shall first be attempted to be resolved informally by contacting the Company.</p>
        </Legal>

        <Legal h="CHANGES TO THESE TERMS">
          <p>We reserve the right to modify these Terms at any time. Material changes will be communicated with at least 30 days' notice. Continued use of the Service after revisions become effective constitutes acceptance of the new Terms.</p>
        </Legal>

        <Legal h="CONTACT US">
          <p>For questions about these Terms, contact us at: <a href="mailto:service@whossteering.com" style={{ color: 'var(--y)' }}>service@whossteering.com</a></p>
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

function Def({ term, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid rgba(232,184,0,.2)' }}>
      <span style={{ color: 'var(--w)', fontWeight: 700, minWidth: 120, flexShrink: 0 }}>{term}</span>
      <span>{children}</span>
    </div>
  );
}
