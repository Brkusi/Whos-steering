import { useNavigate } from 'react-router-dom';
import './Home.css';

import heroBase from '../assets/hero/hero-base.webp';
import heroGrid from '../assets/hero/hero-grid.webp';
import heroSmoke from '../assets/hero/hero-smoke.webp';
import heroCarbon from '../assets/hero/hero-carbon.webp';
import heroWatermark from '../assets/hero/hero-watermark.webp';
import heroWheel from '../assets/hero/hero-wheel-highlighted.webp';
import heroHeadline from '../assets/hero/hero-headline-exact.webp';
import heroSubtitle from '../assets/hero/hero-subtitle-exact.webp';
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
        {/* DESKTOP: true layered hero */}
        <div className="ws-hero-desktop" aria-hidden="true">
          <img className="ws-layer ws-layer--base" src={heroBase} alt="" />
          <img className="ws-layer ws-layer--grid" src={heroGrid} alt="" />
          <img className="ws-layer ws-layer--smoke" src={heroSmoke} alt="" />
          <img className="ws-layer ws-layer--watermark" src={heroWatermark} alt="" />
          <img className="ws-layer ws-layer--carbon" src={heroCarbon} alt="" />

          <img className="ws-hero-headline" src={heroHeadline} alt="" />
          <img className="ws-hero-subtitle" src={heroSubtitle} alt="" />

          <div className="ws-wheel-wrap">
            <div className="ws-wheel-glow" />
            <img className="ws-hero-wheel" src={heroWheel} alt="" />
          </div>
        </div>

        {/* Accessible text: visual typography is the pixel-exact image layer above. */}
        <div className="ws-sr-only">
          <h1>Designed by you. Built by us.</h1>
          <p>Custom steering wheels made to your specification.</p>
        </div>

        {/* MOBILE: approved mobile composition remains the reference visual. */}
        <img
          className="ws-hero-mobile-art"
          src={heroMobileApproved}
          alt="Designed by you. Built by us. Custom steering wheels made to your specification."
          draggable="false"
        />

        {/* REAL React buttons, not baked into the desktop artwork. */}
        <div className="ws-hero-actions">
          <button
            type="button"
            className="ws-hero-btn ws-hero-btn--primary"
            onClick={() => nav('/configure')}
          >
            BUILD YOURS
          </button>

          <button
            type="button"
            className="ws-hero-btn ws-hero-btn--secondary"
            onClick={() => nav('/catalog')}
          >
            EXPLORE WHEELS
          </button>
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
            <span className="ws-brand-card__copy">
              <span className="ws-brand-card__name">{brand.name}</span>
              <span className="ws-brand-card__tag">{brand.tag}</span>
            </span>
            <span className="ws-brand-card__badge">{brand.badge}</span>
          </button>
        ))}
      </section>

      <section className="ws-materials">
        <div className="ws-materials__inner">
          <div>
            <div className="ws-materials__eyebrow">Our Standard</div>
            <h2 className="ws-materials__title">
              MATERIALS &amp;<br />
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
