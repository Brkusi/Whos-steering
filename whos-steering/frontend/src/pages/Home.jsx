import { useNavigate } from 'react-router-dom';
import './Home.css';

import heroDesktop from '../assets/hero/hero-exact-desktop.webp';
import heroMobile from '../assets/hero/hero-exact-mobile.webp';

const MATERIALS = [
  'Carbon fibre base engineered for superior strength, weave consistency, and surface finish',
  'High quality leather selected for luxury feel, durability, and long-term wear',
  'Advanced 3D modelling for precise fitment and OEM-correct ergonomics',
  'Hand stitching applied by skilled craftsmen for a tailored, premium finish',
  'Environmentally conscious production processes implemented where possible',
  'Secure protective packaging to safeguard premium materials during transport',
  'Handcrafted construction with strict quality control standards',
];

const BRAND_CARDS = [
  { id: 'bmw', name: 'BMW', tag: 'M Sport Builds', badge: 'IN STOCK' },
  { id: 'audi', name: 'AUDI', tag: 'RS Edition Builds', badge: 'IN STOCK' },
  { id: 'custom', name: 'CUSTOM', tag: 'Full Configurator', badge: 'CONFIGURE' },
];

export default function Home() {
  const nav = useNavigate();

  const openBrand = (brand) => {
    nav(
      brand.id === 'custom'
        ? '/configure'
        : `/catalog?brand=${encodeURIComponent(brand.name)}`
    );
  };

  return (
    <main className="ws-home">
      {/* EXACT APPROVED HERO RENDER */}
      <section
        id="hero"
        className="ws-exact-hero"
        aria-label="Who's Steering custom steering wheels"
      >
        <picture className="ws-exact-hero__picture">
          <source media="(max-width: 760px)" srcSet={heroMobile} />
          <img
            className="ws-exact-hero__art"
            src={heroDesktop}
            alt="Designed by you. Built by us. Custom steering wheels made to your specification."
            draggable="false"
          />
        </picture>

        {/*
          The approved artwork already contains the visible buttons.
          These transparent React buttons sit exactly over them,
          preserving the approved visual while keeping navigation functional.
        */}
        <button
          type="button"
          className="ws-hero-hotspot ws-hero-hotspot--build"
          onClick={() => nav('/configure')}
          aria-label="Build yours"
        />

        <button
          type="button"
          className="ws-hero-hotspot ws-hero-hotspot--explore"
          onClick={() => nav('/catalog')}
          aria-label="Explore wheels"
        />
      </section>

      {/* BMW / AUDI / CUSTOM STRIP */}
      <section className="ws-brand-strip" aria-label="Shop by category">
        {BRAND_CARDS.map((brand) => (
          <button
            type="button"
            key={brand.id}
            className="ws-brand-card"
            onClick={() => openBrand(brand)}
          >
            <span className="ws-brand-card__copy">
              <span className="ws-brand-card__name">{brand.name}</span>
              <span className="ws-brand-card__tag">{brand.tag}</span>
            </span>

            <span className="ws-brand-card__badge">{brand.badge}</span>
          </button>
        ))}
      </section>

      {/* MATERIALS & CRAFTSMANSHIP */}
      <section className="ws-materials">
        <div className="ws-materials__inner">
          <div>
            <div className="ws-materials__eyebrow">Our Standard</div>

            <h2 className="ws-materials__title">
              MATERIALS &amp;
              <br />
              <span>CRAFTSMANSHIP</span>
            </h2>

            <p className="ws-materials__intro">
              Every wheel we build is a commitment to quality. From the materials
              we select to the hands that assemble them, no detail is overlooked.
            </p>
          </div>

          <div>
            {MATERIALS.map((item, index) => (
              <div className="ws-material-item" key={index}>
                <span className="ws-material-item__icon" aria-hidden="true">
                  <span />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
