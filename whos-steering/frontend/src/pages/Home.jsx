import { useNavigate } from 'react-router-dom';
import './Home.css';

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

  const goToBrand = (brand) => {
    if (brand.id === 'custom') {
      nav('/configure');
      return;
    }

    nav(`/catalog?brand=${encodeURIComponent(brand.name)}`);
  };

  return (
    <main className="home-page">
      {/* ── Hero ── */}
      <section id="hero" className="home-hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-tech" aria-hidden="true" />
        <div className="hero-mobile-watermark" aria-hidden="true" />
        <div className="hero-carbon-sweep" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-copy fade-up">
            <div className="hero-kicker">CUSTOM STEERING WHEELS</div>

            <h1 className="hero-title">
              <span className="hero-title-yellow">DESIGNED BY YOU.</span>
              <span>BUILT BY US.</span>
            </h1>

            <p className="hero-subtitle">
              Custom steering wheels
              <br />
              made to your specification.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="hero-btn hero-btn-primary"
                onClick={() => nav('/configure')}
              >
                BUILD YOURS
              </button>

              <button
                type="button"
                className="hero-btn hero-btn-secondary"
                onClick={() => nav('/catalog')}
              >
                EXPLORE WHEELS
              </button>
            </div>
          </div>

          <div className="hero-product" aria-hidden="true">
            <div className="hero-product-glow" />
            <img
              className="hero-wheel"
              src="/hero/hero-wheel.webp"
              alt=""
              draggable="false"
            />
          </div>
        </div>

        {/* Bottom brand strip */}
        <div className="hero-brand-strip">
          {BRAND_CARDS.map((brand, index) => (
            <button
              type="button"
              key={brand.id}
              className="hero-brand-card"
              onClick={() => goToBrand(brand)}
              aria-label={`${brand.name}: ${brand.tag}`}
            >
              <span className="hero-brand-copy">
                <span className="hero-brand-name">{brand.name}</span>
                <span className="hero-brand-tag">{brand.tag}</span>
              </span>

              <span className="hero-brand-badge">{brand.badge}</span>

              {index < BRAND_CARDS.length - 1 && (
                <span className="hero-brand-divider" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Materials & Craftsmanship ── */}
      <section className="materials-section">
        <div className="materials-inner">
          <div>
            <div className="materials-kicker">Our Standard</div>

            <h2 className="materials-title">
              MATERIALS &amp;
              <br />
              <span>CRAFTSMANSHIP</span>
            </h2>

            <p className="materials-intro">
              Every wheel we build is a commitment to quality. From the materials
              we select to the hands that assemble them, no detail is overlooked.
            </p>
          </div>

          <div>
            {MATERIALS.map((item, index) => (
              <div className="material-row" key={index}>
                <span className="material-icon" aria-hidden="true">
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
