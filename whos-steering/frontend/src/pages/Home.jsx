import { useNavigate } from 'react-router-dom';
import './Home.css';

import heroBase from '../assets/hero/hero-base.webp';
import heroCarbon from '../assets/hero/hero-carbon-reference.webp';
import heroWheel from '../assets/hero/hero-wheel-highlighted.webp';
import heroMobileApproved from '../assets/hero/hero-mobile-approved.webp';

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
      <section id="hero" className="ws-hero">
        {/* DESKTOP — layered, scalable, sharp */}
        <div className="ws-hero-desktop">
          <img
            className="ws-hero-bg"
            src={heroBase}
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          <img
            className="ws-hero-carbon"
            src={heroCarbon}
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          <div className="ws-hero-copy">
            <div className="ws-hero-accent-line" aria-hidden="true" />

            <h1 className="ws-hero-title">
              <span className="ws-hero-title-yellow">DESIGNED BY YOU.</span>
              <span className="ws-hero-title-white">BUILT BY US.</span>
            </h1>

            <p className="ws-hero-subtitle">
              <span>CUSTOM STEERING WHEELS</span>
              <span>MADE TO YOUR SPECIFICATION.</span>
            </p>

            <div className="ws-hero-actions">
              <button
                type="button"
                className="ws-hero-btn ws-hero-btn-primary"
                onClick={() => nav('/configure')}
              >
                BUILD YOURS
              </button>

              <button
                type="button"
                className="ws-hero-btn ws-hero-btn-secondary"
                onClick={() => nav('/catalog')}
              >
                EXPLORE WHEELS
              </button>
            </div>
          </div>

          <div className="ws-wheel-wrap" aria-hidden="true">
            <div className="ws-wheel-backlight" />
            <img
              className="ws-hero-wheel"
              src={heroWheel}
              alt=""
              draggable="false"
            />
          </div>
        </div>

        {/* MOBILE — preserve the mobile composition you already liked */}
        <div className="ws-hero-mobile">
          <img
            className="ws-hero-mobile-art"
            src={heroMobileApproved}
            alt="Designed by you. Built by us. Custom steering wheels made to your specification."
            draggable="false"
          />

          <div className="ws-mobile-actions">
            <button
              type="button"
              className="ws-mobile-btn ws-mobile-btn-primary"
              onClick={() => nav('/configure')}
            >
              BUILD YOURS
            </button>

            <button
              type="button"
              className="ws-mobile-btn ws-mobile-btn-secondary"
              onClick={() => nav('/catalog')}
            >
              EXPLORE WHEELS
            </button>
          </div>
        </div>
      </section>

      <section className="ws-brand-strip" aria-label="Shop by category">
        {BRAND_CARDS.map((brand) => (
          <button
            type="button"
            key={brand.id}
            className="ws-brand-card"
            onClick={() => openBrand(brand)}
          >
            <span className="ws-brand-copy">
              <span className="ws-brand-name">{brand.name}</span>
              <span className="ws-brand-tag">{brand.tag}</span>
            </span>

            <span className="ws-brand-badge">{brand.badge}</span>
          </button>
        ))}
      </section>

      <section className="ws-materials">
        <div className="ws-materials-inner">
          <div>
            <div className="ws-materials-eyebrow">Our Standard</div>

            <h2 className="ws-materials-title">
              MATERIALS &amp;
              <br />
              <span>CRAFTSMANSHIP</span>
            </h2>

            <p className="ws-materials-intro">
              Every wheel we build is a commitment to quality. From the materials
              we select to the hands that assemble them, no detail is overlooked.
            </p>
          </div>

          <div>
            {MATERIALS.map((item, index) => (
              <div className="ws-material-item" key={index}>
                <span className="ws-material-icon" aria-hidden="true">
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