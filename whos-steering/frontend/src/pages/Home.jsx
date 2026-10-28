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

export default function Home() {

  return (
    <main className="ws-home">
      <RevolvingShowroom />

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
