import { useEffect, useRef } from 'react';

const ITEMS = [
  '⚡ Handcrafted to your exact specification',
  '📍 Engineered in Florida · Assembled in New York City',
  '🌍 International Shipping Available Worldwide',
  '🛡 Every build backed by a 6-Month Warranty',
  '⏱ Production Time: 3–4 Weeks from Order Confirmation',
  '🔧 Precision-fit for BMW & Audi — OEM-correct ergonomics',
  '✈️ We ship globally — no matter where you are, we deliver',
  '🏁 Race-inspired materials. Street-legal quality.',
];

export default function AnnouncementBar() {
  const trackRef = useRef(null);

  // CSS animation via a <style> tag — no extra dependencies
  return (
    <>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker 38s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
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

        <div className="ticker-track" ref={trackRef}>
          {/* Duplicate for seamless loop */}
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <span key={i} style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2,
              color: '#000',
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