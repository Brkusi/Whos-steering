import { Link } from 'react-router-dom';
import './Home.css';
import FeaturedWheels from '../components/FeaturedWheels';

import RevolvingShowroom from '../components/RevolvingShowroom';

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
  { id: 'bmw', name: 'BMW', tag: 'M Sport Builds', badge: 'IN STOCK', path: '/catalog?brand=BMW' },
  { id: 'audi', name: 'AUDI', tag: 'B9 & RS Builds', badge: 'IN STOCK', path: '/catalog?brand=AUDI' },
  { id: 'mercedes', name: 'MERCEDES', tag: 'AMG & Classic Builds', badge: 'CONFIGURE', path: '/build?brand=MERCEDES' },
  { id: 'toyota', name: 'TOYOTA', tag: 'Supra GR Builds', badge: 'CONFIGURE', path: '/build?brand=TOYOTA' },
  { id: 'porsche', name: 'PORSCHE', tag: '911 Performance Builds', badge: 'CONFIGURE', path: '/build?brand=PORSCHE' },
  { id: 'dodge', name: 'DODGE', tag: 'SRT Performance Builds', badge: 'CONFIGURE', path: '/build?brand=DODGE_SRT' },
];

export default function Home() {

  return (
    <main className="ws-home">
      <RevolvingShowroom />
      <section className="ws-brand-strip" aria-label="Shop by vehicle brand">
        {BRAND_CARDS.map((brand, index) => (
          <Link key={brand.id} className="ws-brand-card" to={brand.path}>
            <img className="ws-brand-thumbnail" src={['/BMW_PRESET_1.png', '/PRESET_1.png', '/models/mercedes-amg/source/round.webp', '/models/supra-gr/source/flat-round.webp', '/models/porsche-992/source/flat-round.webp', '/models/dodge-srt/source/round.webp'][index]} alt="" loading="lazy" />
            <span className="ws-brand-copy"><span className="ws-brand-name">{brand.name}</span><span className="ws-brand-tag">{brand.tag}</span></span>
            <span className="ws-brand-badge">{brand.badge} <span aria-hidden="true">↗</span></span>
          </Link>
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
