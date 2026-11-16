import {blackFridayActive} from '../lib/blackFriday';

const ITEMS = [
  '⚡ Handcrafted to your exact specification',
  '📍 Engineered in Florida · Assembled in New York City',
  '🌍 FREE SHIPPING ON ALL PRODUCTS WORLDWIDE',
  '🛡 Every build backed by a 6-Month Warranty',
  '⏱ Custom Build Time: 3–5 Weeks from Order Confirmation',
  '🔧 Custom wheels for BMW, Audi, Mercedes, Toyota, Porsche & Dodge SRT — fitment confirmed from your wheel photo',
  '✈️ Free worldwide shipping — every product, every order',
  '🏁 Race-inspired materials. Street-legal quality.',
];

export default function AnnouncementBar() {

  const items=blackFridayActive() ? ['BLACK FRIDAY SPECIAL · Nov 11–28 · Infiniti airbag covers from $159.99 · 10% off custom steering wheels · In-stock wheels excluded',...ITEMS] : ITEMS;
  // CSS animation via a <style> tag — no extra dependencies
  return (
    <>
      <style>{`
        @media(prefers-reduced-motion:reduce) {
          .shipping-promo { position:absolute;left:0;top:0;bottom:0;z-index:3;display:flex;align-items:center;padding:0 18px;background:#101813;color:#4ade80;font-family:Rajdhani,sans-serif;font-size:13px;font-weight:700;letter-spacing:.7px;box-shadow:12px 0 20px #10181355; }
        .shipping-promo-short {display:none}
        .shipping-promo + .ticker-track {padding-left:300px}
        @media(max-width:600px){.shipping-promo{padding:0 12px;font-size:12px}.shipping-promo-long{display:none}.shipping-promo-short{display:inline}.shipping-promo + .ticker-track{padding-left:145px}}
        .ticker-track { animation: ticker 38s linear infinite!important; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .shipping-promo { position:absolute;left:0;top:0;bottom:0;z-index:3;display:flex;align-items:center;padding:0 18px;background:#101813;color:#4ade80;font-family:Rajdhani,sans-serif;font-size:13px;font-weight:700;letter-spacing:.7px;box-shadow:12px 0 20px #10181355; }
        .shipping-promo-short {display:none}
        .shipping-promo + .ticker-track {padding-left:300px}
        @media(max-width:600px){.shipping-promo{padding:0 12px;font-size:12px}.shipping-promo-long{display:none}.shipping-promo-short{display:inline}.shipping-promo + .ticker-track{padding-left:145px}}
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker 38s linear infinite;
        }
      `}</style>

      <div style={{
        position: 'sticky', top: 0, left: 0, right: 0,
        height: 32, background: 'var(--y)', zIndex: 1100,
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,.15)',
      }}>
        {/* Fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right, var(--y), transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, var(--y), transparent)', zIndex: 2, pointerEvents: 'none' }} />

        <div className="shipping-promo" aria-label="Free shipping on all products worldwide"><span className="shipping-promo-long">FREE SHIPPING ON ALL PRODUCTS</span><span className="shipping-promo-short" aria-hidden="true">FREE SHIPPING</span></div>
        <div className="ticker-track">
          {/* Duplicate for seamless loop */}
          {[...items, ...items].map((item, i) => (
            <span key={i} style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: .6,
              color: item.toLowerCase().includes('free ')?'#14532d':'#000',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              padding: '0 40px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {item}
              <span style={{ opacity: .35, fontSize: 6 }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
