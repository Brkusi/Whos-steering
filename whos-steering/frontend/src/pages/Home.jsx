import { useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedWheels from '../components/FeaturedWheels';
import heroWheel from '../assets/hero/hero-wheel-highlighted.webp';
import './Home.css';
const finishes = [{
  name: 'Classic carbon',
  image: '/classic/classic-black.png',
  description: 'A precise, woven pattern. Explore classic carbon finishes in your build.'
}, {
  name: 'Forged carbon',
  image: '/forged/forged-classic.jpeg',
  description: 'An expressive, marbled texture. Explore forged carbon finishes in your build.'
}, {
  name: 'Honeycomb',
  image: '/HoneyComb.jpeg',
  description: 'A geometric carbon pattern. Explore honeycomb finishes in your build.'
}];
export default function Home() {
  const [finish, setFinish] = useState(0);
  return <main className="showroom">
    <section className="showroom-hero">
      <div className="showroom-grid" aria-hidden="true" /><div className="showroom-wordmark" aria-hidden="true">YOUR DRIVE.</div>
      <div className="showroom-copy"><p className="eyebrow">Custom steering wheels</p><h1>Designed by you.<br /><em>Built by us.</em></h1><p className="showroom-intro">The part of your car you connect with most.<br />Make every detail your own.</p><div className="showroom-actions"><Link className="btn" to="/build">Build your wheel ↗</Link><Link className="btn-outline" to="/catalog">Shop preconfigured</Link></div><div className="showroom-fitment"><span>Custom builds for</span><Link to="/configure?brand=BMW">BMW ↗</Link><Link to="/configure?brand=AUDI">Audi ↗</Link></div></div>
      <div className="showroom-stage"><div className="showroom-orbit" aria-hidden="true" /><img className="showroom-wheel" src={heroWheel} alt="Who's Steering custom BMW-style wheel with carbon trim, red center stripe and M-color stitching" fetchpriority="high" /><div className="showroom-caption"><span className="eyebrow">The details make the difference</span><span>Carbon trim / Hand stitching / Your specification</span></div></div><a className="showroom-scroll" href="#discover">Explore the details <span aria-hidden="true">↓</span></a>
    </section>
    <section className="showroom-paths reveal" id="discover" aria-labelledby="paths-title"><div className="section-heading"><div><p className="eyebrow">Your wheel. Your way.</p><h2 id="paths-title">Two ways to make it yours.</h2></div><p>Start with your own vision.<br />Or find a build that already feels right.</p></div><div className="path-grid">
      <Link to="/build" className="path-card"><img src="/BMW_PRESET_1.png" alt="BMW steering wheel with carbon trim" loading="lazy" /><div><span className="eyebrow">01 / Custom made</span><h3>Every detail.<br />Your decision.</h3><p>Choose your vehicle, materials, stitching, and finishing touches.</p><span className="text-link">Start your custom build <b>↗</b></span></div></Link>
      <Link to="/catalog" className="path-card"><img src="/PRESET_1.png" alt="Preconfigured Audi-style steering wheel" loading="lazy" /><div><span className="eyebrow">02 / Preconfigured</span><h3>Find your<br />signature style.</h3><p>Explore our existing wheel designs and their available options.</p><span className="text-link">Explore the collection <b>↗</b></span></div></Link>
    </div></section>
    <section className="material-studio reveal" aria-labelledby="material-title"><div className="material-visual"><img key={finish} src={finishes[finish].image} alt={`${finishes[finish].name} material sample`} loading="lazy" /><span>Material study / 0{finish + 1}</span></div><div className="material-copy"><p className="eyebrow">Built around your taste</p><h2 id="material-title">Start with<br />what moves you.</h2><p>Explore the textures, then bring your wheel together in the configurator.</p><div className="material-swatches" role="group" aria-label="Explore carbon finishes">{finishes.map((item, i) => <button key={item.name} aria-pressed={finish === i} onClick={() => setFinish(i)}><img src={item.image} alt="" loading="lazy" /><span>{item.name}</span></button>)}</div><p className="material-description" aria-live="polite">{finishes[finish].description}</p><Link className="text-link" to="/build">Make it yours <b>↗</b></Link></div></section>
    <div className="showroom-featured reveal"><FeaturedWheels /></div>
    <section className="showroom-process reveal" aria-labelledby="process-title"><div className="section-heading"><div><p className="eyebrow">From idea to your interior</p><h2 id="process-title">Your build, made simple.</h2></div><Link className="text-link" to="/track-order">Track an existing order ↗</Link></div><div className="process-grid">{[['01', 'Choose your vehicle', 'Start with BMW or Audi, then tell us your model and year.'], ['02', 'Make it personal', 'Choose materials, colors and features. Upload your current wheel photo for fitment.'], ['03', 'Review every detail', 'Check your specification and total before continuing to checkout.']].map(([n, title, copy]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="showroom-help reveal"><div><p className="eyebrow">A little guidance goes a long way</p><h2>Not sure where to start?</h2><p>Tell us about your vehicle and the look you have in mind.</p></div><Link className="btn-outline" to="/contact">Talk to our team ↗</Link></section>
  </main>;
}
