import { useState } from 'react';

export default function ZoomableImage({ src, alt, imgStyle, iconSize = 20, corner = 'right' }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...imgStyle }} />
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        aria-label="Zoom image"
        style={{
          position: 'absolute', top: 4, [corner]: 4, width: iconSize, height: iconSize,
          background: 'rgba(0,0,0,.65)', border: '1px solid rgba(232,184,0,.5)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'zoom-in', color: 'var(--y)', fontSize: iconSize * 0.55, lineHeight: 1,
          padding: 0, zIndex: 3,
        }}
      >🔍</button>

      {open && (
        <div
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.9)', zIndex: 5000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out',
          }}
        >
          <img src={src} alt={alt} style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', boxShadow: '0 0 40px rgba(0,0,0,.6)' }} />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            style={{ position: 'absolute', top: 20, right: 24, background: 'transparent', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}
          >×</button>
        </div>
      )}
    </>
  );
}
