import { MAT_HEX, TRIS } from '../lib/data';

export default function WheelPreview({ config, size = 320 }) {
  const {
    brand = 'BMW', audiBadge = 'RS',
    stripeMode = 'none', stripeColor, triKey,
    topBottomMat = 'Alcantara', topBottomCol,
    sideMat = 'Alcantara', sideCol,
    plasticTrimCol, innerTrimCol, innerTrimMatchCarbon,
  } = config || {};

  const badge = brand === 'AUDI' ? audiBadge : 'BMW';
  const sc = sideCol || MAT_HEX[sideMat] || '#2A2A2A';
  const tc = topBottomCol || MAT_HEX[topBottomMat] || '#2A2A2A';
  const innerTrimStroke = innerTrimMatchCarbon ? (MAT_HEX[topBottomMat] || '#1A1A1A') : innerTrimCol;

  const tri = triKey ? TRIS[triKey] : null;
  const showSolid = stripeMode === 'single' && stripeColor;
  const showTri = stripeMode === 'tri' && tri;

  return (
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"
      width={size} height={size}
      style={{ filter: 'drop-shadow(0 0 50px rgba(232,184,0,.15))', transition: 'transform .3s' }}>
      <circle cx="150" cy="150" r="143" fill="#1A1A1A" />

      {/* Top stripe – solid */}
      {showSolid && (
        <rect x="132" y="7" width="36" height="28" rx="3" fill={stripeColor} />
      )}
      {/* Top stripe – tri-color */}
      {showTri && (
        <g>
          <rect x="132" y="7" width="12" height="28" rx="2" fill={tri.c1} />
          <rect x="144" y="7" width="12" height="28" fill={tri.c2} />
          <rect x="156" y="7" width="12" height="28" rx="2" fill={tri.c3} />
        </g>
      )}

      {/* Rim */}
      <path d="M150 10 A140 140 0 0 1 290 150 A140 140 0 0 1 150 290 A140 140 0 0 1 10 150 A140 140 0 0 1 150 10"
        fill="none" stroke="#2A2A2A" strokeWidth="26" />

      {/* Spokes – top/bottom grip color */}
      <line x1="150" y1="88" x2="150" y2="10"  stroke={tc} strokeWidth="7" strokeLinecap="round" />
      <line x1="150" y1="212" x2="150" y2="290" stroke={tc} strokeWidth="7" strokeLinecap="round" />
      <path d="M60 248 Q150 292 240 248" stroke={tc} strokeWidth="14" fill="none" strokeLinecap="round" />

      {/* Side grips */}
      <line x1="88" y1="150" x2="10" y2="150"  stroke="#333" strokeWidth="7" strokeLinecap="round" />
      <line x1="212" y1="150" x2="290" y2="150" stroke="#333" strokeWidth="7" strokeLinecap="round" />
      <rect x="5"   y="118" width="20" height="64" rx="3" fill={sc} />
      <rect x="275" y="118" width="20" height="64" rx="3" fill={sc} />

      {/* Center hub */}
      <circle cx="150" cy="150" r="37" fill="#111" stroke="#2E2E2E" strokeWidth="2" />
      <text x="150" y="157" textAnchor="middle" fill="#E8B800"
        fontFamily="Orbitron, monospace" fontSize="20" letterSpacing="2">{badge}</text>

      {/* Audi trim rings */}
      {plasticTrimCol && <circle cx="150" cy="150" r="143" fill="none" stroke={plasticTrimCol} strokeWidth="4" />}
      {innerTrimStroke && <circle cx="150" cy="150" r="37"  fill="none" stroke={innerTrimStroke} strokeWidth="4" />}
    </svg>
  );
}
