import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUDI_PRESETS_FULL as AUDI_PRESETS, BMW_PRESETS } from '../lib/data';
import './FeaturedWheels.css';

const BRANDS = ['BMW', 'AUDI'];

export default function FeaturedWheels() {
  const nav = useNavigate();
  const railRef = useRef(null);
  const [activeBrand, setActiveBrand] = useState('BMW');

  const wheelsByBrand = useMemo(
    () => ({
      BMW: BMW_PRESETS.filter(Boolean),
      AUDI: AUDI_PRESETS.filter(Boolean),
    }),
    []
  );

  const wheels = wheelsByBrand[activeBrand] || [];

  const selectBrand = (brand) => {
    setActiveBrand(brand);

    requestAnimationFrame(() => {
      if (railRef.current) railRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    });
  };

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.max(280, rail.clientWidth * 0.78),
      behavior: 'smooth',
    });
  };

  const openWheel = (wheel) => {
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
          className="featured-wheels__rail"
          aria-live="polite"
        >
          {wheels.map((wheel) => (
            <button
              type="button"
              className="featured-wheel-card"
              key={wheel.id}
              onClick={() => openWheel(wheel)}
              aria-label={`View ${wheel.brand} ${wheel.name}, starting at $${wheel.base_price.toFixed(2)}`}
            >
              <div className="featured-wheel-card__image-wrap">
                <img
                  src={wheel.images[0]}
                  alt={`${wheel.brand} ${wheel.name} steering wheel`}
                  className="featured-wheel-card__image"
                  loading="lazy"
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
            <span />
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