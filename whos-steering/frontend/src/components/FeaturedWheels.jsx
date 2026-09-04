import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUDI_PRESETS_FULL as AUDI_PRESETS, BMW_PRESETS, INFINITI_PRESETS } from '../lib/data';
import './FeaturedWheels.css';

const BRANDS = ['BMW', 'AUDI', 'INFINITI'];

export default function FeaturedWheels() {
  const nav = useNavigate();
  const railRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [activeBrand, setActiveBrand] = useState('BMW');
  const [railIndicator, setRailIndicator] = useState({ left: 0, width: 34 });
  const [showLaborPromo, setShowLaborPromo] = useState(false);
  const [promoCopied, setPromoCopied] = useState(false);

  const wheelsByBrand = useMemo(
    () => ({
      BMW: BMW_PRESETS.filter(Boolean),
      AUDI: AUDI_PRESETS.filter(Boolean),
      INFINITI: INFINITI_PRESETS.filter(Boolean),
    }),
    []
  );

  const wheels = wheelsByBrand[activeBrand] || [];

  useEffect(() => {
    let timer;
    try {
      const seen = window.sessionStorage.getItem('ws-labor-promo-seen-v1');
      if (!seen) {
        timer = window.setTimeout(() => {
          setShowLaborPromo(true);
          window.sessionStorage.setItem('ws-labor-promo-seen-v1', '1');
        }, 650);
      }
    } catch {
      timer = window.setTimeout(() => setShowLaborPromo(true), 650);
    }

    return () => window.clearTimeout(timer);
  }, []);

  const copyLaborCode = async () => {
    try {
      await navigator.clipboard.writeText('LABOR');
      setPromoCopied(true);
      window.setTimeout(() => setPromoCopied(false), 1600);
    } catch {
      setPromoCopied(false);
    }
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const updateIndicator = () => {
      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const visibleRatio = rail.scrollWidth > 0 ? rail.clientWidth / rail.scrollWidth : 1;
      const width = Math.max(18, Math.min(100, visibleRatio * 100));
      const progress = maxScroll > 0 ? Math.max(0, Math.min(1, rail.scrollLeft / maxScroll)) : 0;
      const left = progress * (100 - width);

      setRailIndicator(prev => {
        if (Math.abs(prev.left - left) < 0.15 && Math.abs(prev.width - width) < 0.15) return prev;
        return { left, width };
      });
    };

    const frame = requestAnimationFrame(updateIndicator);
    rail.addEventListener('scroll', updateIndicator, { passive: true });
    window.addEventListener('resize', updateIndicator);

    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener('scroll', updateIndicator);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeBrand, wheels.length]);

  const selectBrand = (brand) => {
    setActiveBrand(brand);
    setRailIndicator(prev => ({ ...prev, left: 0 }));

    requestAnimationFrame(() => {
      if (railRef.current) railRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    });
  };

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;

    const firstCard = rail.querySelector('.featured-wheel-card');
    const styles = window.getComputedStyle(rail);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : rail.clientWidth * 0.72;

    rail.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  const handlePointerDown = (event) => {
    // Touch already has excellent native swipe/scroll behavior. Mouse/pen get drag-to-slide.
    if (event.pointerType === 'touch' || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const rail = railRef.current;
    if (!rail) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startLeft: rail.scrollLeft,
      moved: false,
    };
    suppressClickRef.current = false;
    setDragging(true);
    rail.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (!rail || !drag.active) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 6) {
      drag.moved = true;
      suppressClickRef.current = true;
    }
    rail.scrollLeft = drag.startLeft - delta;
  };

  const endDrag = (event) => {
    if (!dragRef.current.active) return;
    const moved = dragRef.current.moved;
    dragRef.current.active = false;
    setDragging(false);
    railRef.current?.releasePointerCapture?.(event.pointerId);

    // Ignore only the synthetic click that immediately follows a drag.
    // Do not leave the next real customer click permanently suppressed.
    if (moved) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 180);
    }
  };

  const wheelUrl = (wheel) =>
    `/catalog?brand=${encodeURIComponent(wheel.brand)}&preset=${encodeURIComponent(wheel.id)}`;

  const openWheel = (wheel, event) => {
    if (suppressClickRef.current) {
      event?.preventDefault();
      return;
    }

    nav(wheelUrl(wheel));
  };

  const openWheelFromCta = (wheel, event) => {
    event?.stopPropagation();
    event?.preventDefault();
    suppressClickRef.current = false;
    nav(wheelUrl(wheel));
  };

  return (
    <>
      {showLaborPromo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Labor promo code"
          onClick={() => setShowLaborPromo(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'grid', placeItems: 'center', padding: 20,
            background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(7px)',
            animation: 'wsPromoFade .28s ease-out both',
          }}
        >
          <style>{`
            @keyframes wsPromoFade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes wsPromoDrop {
              0% { opacity: 0; transform: translateY(-34px) scale(.92) rotate(-1.4deg); }
              62% { opacity: 1; transform: translateY(7px) scale(1.018) rotate(.35deg); }
              100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
            }
            @keyframes wsPromoSweep {
              0% { transform: translateX(-150%) skewX(-22deg); opacity: 0; }
              20% { opacity: .75; }
              55%, 100% { transform: translateX(260%) skewX(-22deg); opacity: 0; }
            }
            @keyframes wsPromoPulse {
              0%,100% { box-shadow: 0 0 0 rgba(232,184,0,0), 0 25px 80px rgba(0,0,0,.65); }
              50% { box-shadow: 0 0 38px rgba(232,184,0,.22), 0 25px 80px rgba(0,0,0,.65); }
            }
          `}</style>

          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'relative', width: 'min(520px, 94vw)', overflow: 'hidden',
              background: 'linear-gradient(145deg,#171717 0%,#090909 70%)',
              border: '1px solid rgba(232,184,0,.55)',
              animation: 'wsPromoDrop .58s cubic-bezier(.2,.85,.2,1) both, wsPromoPulse 2.6s ease-in-out 1s infinite',
            }}
          >
            <div style={{ position: 'absolute', inset: '0 auto 0 0', width: 7, background: 'var(--y)' }} />
            <div style={{ position: 'absolute', top: -70, right: -45, width: 190, height: 190, borderRadius: '50%', border: '28px solid rgba(232,184,0,.06)' }} />
            <div style={{ position: 'absolute', inset: 0, width: '28%', background: 'linear-gradient(90deg,transparent,rgba(255,220,70,.18),transparent)', animation: 'wsPromoSweep 2.2s ease-in-out .4s infinite', pointerEvents: 'none' }} />

            <button
              type="button"
              aria-label="Close promotion"
              onClick={() => setShowLaborPromo(false)}
              style={{ position: 'absolute', right: 14, top: 12, zIndex: 3, border: 0, background: 'transparent', color: '#aaa', fontSize: 23, cursor: 'pointer' }}
            >×</button>

            <div style={{ position: 'relative', zIndex: 2, padding: '30px 30px 26px 36px' }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'var(--y)', marginBottom: 10 }}>
                LIMITED PROMO
              </div>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontStyle: 'italic', fontWeight: 900, fontSize: 'clamp(40px,8vw,66px)', lineHeight: .9, color: '#fff' }}>
                TAKE <span style={{ color: 'var(--y)' }}>10% OFF</span>
              </div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 15, lineHeight: 1.55, color: '#b7b7b7', marginTop: 14 }}>
                Use the code below at checkout. Tap it to copy.
              </div>

              <button
                type="button"
                onClick={copyLaborCode}
                style={{
                  width: '100%', marginTop: 18, padding: '16px 18px', cursor: 'pointer',
                  border: '1px dashed rgba(232,184,0,.75)', background: 'rgba(232,184,0,.08)',
                  color: 'var(--y)', fontFamily: 'Orbitron, monospace', fontWeight: 800,
                  fontSize: 20, letterSpacing: 6,
                }}
              >
                {promoCopied ? 'COPIED ✓' : 'LABOR'}
              </button>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => { setShowLaborPromo(false); nav('/catalog'); }}
                  style={{ clipPath: 'none', flex: 1, padding: '13px 16px' }}
                >
                  SHOP WHEELS
                </button>
                <button
                  type="button"
                  onClick={() => setShowLaborPromo(false)}
                  style={{ flex: 1, border: '1px solid #333', background: '#0c0c0c', color: '#aaa', cursor: 'pointer', fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 1.5 }}
                >
                  CONTINUE SITE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .featured-wheel-card__image-wrap {
          height: clamp(320px, 28vw, 480px) !important;
          aspect-ratio: auto !important;
        }
        .featured-wheel-card__image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center !important;
        }
        .featured-wheel-card__view {
          appearance: none;
          cursor: pointer;
        }
        @media (max-width: 767px) {
          .featured-wheel-card__image-wrap {
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
          }
        }
      `}</style>

      <section className="featured-wheels" aria-labelledby="featured-wheels-title">
      <div className="featured-wheels__inner">
        <div className="featured-wheels__top">
          <div>
            <div className="featured-wheels__eyebrow">CURATED BUILDS</div>
            <h2 id="featured-wheels-title" className="featured-wheels__title">
              SHOP BY BRAND<span>.</span>
            </h2>
          </div>

          <button
            type="button"
            className="featured-wheels__view-all"
            onClick={() => nav(`/catalog?brand=${activeBrand}`)}
          >
            VIEW ALL {activeBrand}
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="featured-wheels__tabs" role="tablist" aria-label="Steering wheel brand">
          {BRANDS.map((brand) => (
            <button
              type="button"
              key={brand}
              role="tab"
              aria-selected={activeBrand === brand}
              className={`featured-wheels__tab${activeBrand === brand ? ' is-active' : ''}`}
              onClick={() => selectBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>

        <div
          ref={railRef}
          className={`featured-wheels__rail${dragging ? ' is-dragging' : ''}`}
          aria-live="polite"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={(event) => {
            if (dragRef.current.active && event.buttons === 0) endDrag(event);
          }}
        >
          {wheels.map((wheel) => (
            <article
              className="featured-wheel-card"
              key={wheel.id}
              aria-label={wheel.readyToShip ? `${wheel.brand} ${wheel.name}, ready to ship at ${wheel.base_price.toFixed(2)}` : `${wheel.brand} ${wheel.name}, starting at ${wheel.base_price.toFixed(2)}`}
            >
              <div
                className="featured-wheel-card__image-wrap"
                role="link"
                tabIndex={0}
                aria-label={`Open ${wheel.name} details`}
                onClick={(event) => openWheel(wheel, event)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    suppressClickRef.current = false;
                    nav(wheelUrl(wheel));
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={wheel.images[0]}
                  alt={`${wheel.brand} ${wheel.name} steering wheel`}
                  className="featured-wheel-card__image"
                  loading="lazy"
                  draggable="false"
                  style={{ cursor: 'pointer' }}
                />

                <span className="featured-wheel-card__brand">
                  {wheel.brand}
                </span>

                <button
                  type="button"
                  className="featured-wheel-card__view"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => openWheelFromCta(wheel, event)}
                  aria-label={`${wheel.readyToShip ? 'View wheel' : 'View build'}: ${wheel.name}`}
                >
                  {wheel.readyToShip ? 'VIEW WHEEL' : 'VIEW BUILD'} <span aria-hidden="true">↗</span>
                </button>
              </div>

              <div className="featured-wheel-card__body">
                <h3 className="featured-wheel-card__name">{wheel.name}</h3>

                <p className="featured-wheel-card__compat">
                  {wheel.compat}
                </p>

                {wheel.readyToShip && (
                  <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 1.3, color: 'var(--y)', marginTop: -6, marginBottom: 8 }}>
                    ALREADY BUILT · READY TO SHIP
                  </div>
                )}

                <div className="featured-wheel-card__price">
                  <span>{wheel.readyShipOption ? 'FROM' : (wheel.readyToShip ? 'PRICE' : 'FROM')}</span>
                  ${wheel.base_price.toFixed(2)}
                </div>
                {wheel.readyShipOption && (
                  <div style={{ fontSize: 9, color: 'var(--t)', letterSpacing: 1, marginTop: 4 }}>
                    ${wheel.readyShipOption.selectedPrice.toFixed(2)} WITH INSERTS · PADDLES NOT INCLUDED
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="featured-wheels__footer">
          <div className="featured-wheels__line" aria-hidden="true">
            <span style={{ left: `${railIndicator.left}%`, width: `${railIndicator.width}%` }} />
          </div>

          <div className="featured-wheels__controls">
            <button
              type="button"
              className="featured-wheels__arrow"
              onClick={() => scrollRail(-1)}
              aria-label="Previous wheels"
            >
              ←
            </button>

            <button
              type="button"
              className="featured-wheels__arrow"
              onClick={() => scrollRail(1)}
              aria-label="Next wheels"
            >
              →
            </button>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
