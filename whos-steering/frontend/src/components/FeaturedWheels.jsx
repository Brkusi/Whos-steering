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
    dragRef.current.active = false;
    setDragging(false);
    railRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const openWheel = (wheel, event) => {
    if (suppressClickRef.current) {
      event?.preventDefault();
      suppressClickRef.current = false;
      return;
    }

    nav(
      `/catalog?brand=${encodeURIComponent(wheel.brand)}&preset=${encodeURIComponent(wheel.id)}`
    );
  };

  return (
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
            <button
              type="button"
              className="featured-wheel-card"
              key={wheel.id}
              onClick={(event) => openWheel(wheel, event)}
              aria-label={`View ${wheel.brand} ${wheel.name}, starting at $${wheel.base_price.toFixed(2)}`}
            >
              <div className="featured-wheel-card__image-wrap">
                <img
                  src={wheel.images[0]}
                  alt={`${wheel.brand} ${wheel.name} steering wheel`}
                  className="featured-wheel-card__image"
                  loading="lazy"
                  draggable="false"
                />

                <span className="featured-wheel-card__brand">
                  {wheel.brand}
                </span>

                <span className="featured-wheel-card__view">
                  VIEW BUILD <span aria-hidden="true">↗</span>
                </span>
              </div>

              <div className="featured-wheel-card__body">
                <h3 className="featured-wheel-card__name">{wheel.name}</h3>

                <p className="featured-wheel-card__compat">
                  {wheel.compat}
                </p>

                <div className="featured-wheel-card__price">
                  <span>FROM</span>
                  ${wheel.base_price.toFixed(2)}
                </div>
              </div>
            </button>
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
  );
}