import { useNavigate, Link } from 'react-router-dom';
import './Home.css';
import FeaturedWheels from '../components/FeaturedWheels';

import heroBase from '../assets/hero/hero-base.webp';
import heroCarbon from '../assets/hero/hero-carbon-reference.webp';
import heroWheel from '../assets/hero/hero-wheel-highlighted.webp';

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
        ? '/build'
        : `/catalog?brand=${encodeURIComponent(brand.name)}`
    );
  };

  return (
    <main className="ws-home">
      <section id="hero" className="ws-hero">
        {/* =====================================================
            DESKTOP
            Everything below lives inside ONE 1672×739 stage.
            Background + wheel + copy + buttons scale together.
        ====================================================== */}
        <div className="ws-stage ws-stage-desktop">
          <img
            className="ws-stage-bg"
            src={heroBase}
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          <img
            className="ws-stage-carbon"
            src={heroCarbon}
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          <div className="ws-stage-copy">
            <div className="ws-stage-line" aria-hidden="true" />

            <h1 className="ws-stage-title">
              <span className="ws-stage-title-yellow">DESIGNED BY YOU.</span>
              <span className="ws-stage-title-white">BUILT BY US.</span>
            </h1>

            <p className="ws-stage-subtitle">
              <span>CUSTOM STEERING WHEELS</span>
              <span>MADE TO YOUR SPECIFICATION.</span>
            </p>

            <div className="ws-stage-actions">
              <button
                type="button"
                className="ws-stage-btn ws-stage-btn-primary"
                onClick={() => nav('/build')}
              >
                BUILD YOURS
              </button>

              <button
                type="button"
                className="ws-stage-btn ws-stage-btn-secondary"
                onClick={() => nav('/catalog')}
              >
                EXPLORE WHEELS
              </button>
            </div>
          </div>

          <div className="ws-stage-wheel" aria-hidden="true">
            <div className="ws-wheel-glow" />
            <img
              src={heroWheel}
              alt=""
              className="ws-wheel-image"
              draggable="false"
            />
          </div>
        </div>

        {/* =====================================================
            MOBILE
            Separate fixed-ratio design stage.
            Again, background + wheel + copy + buttons all move
            and scale together.
        ====================================================== */}
        <div className="ws-stage ws-stage-mobile">
          <img
            className="ws-mobile-bg"
            src={heroBase}
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          <div className="ws-mobile-copy">
            <h1 className="ws-mobile-title">
              <span>DESIGNED BY YOU.</span>
              <strong>BUILT BY US.</strong>
            </h1>

            <p className="ws-mobile-subtitle">
              <span>CUSTOM STEERING WHEELS</span>
              <span>MADE TO YOUR SPECIFICATION.</span>
            </p>
          </div>

          <div className="ws-mobile-wheel" aria-hidden="true">
            <div className="ws-wheel-glow ws-wheel-glow-mobile" />
            <img
              src={heroWheel}
              alt=""
              className="ws-wheel-image"
              draggable="false"
            />
          </div>

          <div className="ws-mobile-actions">
            <button
              type="button"
              className="ws-mobile-btn ws-mobile-btn-primary"
              onClick={() => nav('/build')}
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

    <section className="showroom-paths reveal" id="discover" aria-labelledby="paths-title"><div className="section-heading"><div><p className="eyebrow">Your wheel. Your way.</p><h2 id="paths-title">Two ways to make it yours.</h2></div><p>Start with your own vision.<br />Or find a build that already feels right.</p></div><div className="path-grid">
      <Link to="/build" className="path-card"><img src="/BMW_PRESET_1.png" alt="BMW steering wheel with carbon trim" loading="lazy" /><div><span className="eyebrow">01 / Custom made</span><h3>Every detail.<br />Your decision.</h3><p>Choose your vehicle, materials, stitching, and finishing touches.</p><span className="text-link">Start your custom build <b>↗</b></span></div></Link>
      <Link to="/catalog" className="path-card"><img src="/PRESET_1.png" alt="Catalog Audi-style steering wheel" loading="lazy" /><div><span className="eyebrow">02 / Catalog</span><h3>Find your<br />signature style.</h3><p>Explore our existing wheel designs and their available options.</p><span className="text-link">Explore wheels <b>↗</b></span></div></Link>
    </div></section>

      <FeaturedWheels />

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
