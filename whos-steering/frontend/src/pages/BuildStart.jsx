import { useNavigate } from 'react-router-dom';
import { BMW_PRESETS, AUDI_PRESETS_FULL as AUDI_PRESETS } from '../lib/data';
import './BuildStart.css';

const BRANDS = [
  {
    id: 'BMW',
    eyebrow: 'BMW',
    title: 'BUILD YOUR BMW',
    subtitle: 'M-inspired custom steering wheels built to your exact specification.',
    image: BMW_PRESETS.find(Boolean)?.images?.[0] || '/BMW_PRESET_1.png',
    fitment: 'BMW F-Series & G-Series',
  },
  {
    id: 'AUDI',
    eyebrow: 'AUDI',
    title: 'BUILD YOUR AUDI',
    subtitle: 'RS-inspired custom steering wheels with B9 and R8-style configurations.',
    image: AUDI_PRESETS.find(Boolean)?.images?.[0] || '/PRESET_1.png',
    fitment: 'Audi 2011+ · B9 & R8 Styles',
  },
];

export default function BuildStart() {
  const nav = useNavigate();

  return (
    <main className="build-start">
      <section className="build-start__inner">
        <div className="build-start__eyebrow">START YOUR BUILD</div>
        <h1 className="build-start__title">SELECT YOUR VEHICLE BRAND<span>.</span></h1>
        <p className="build-start__intro">
          Choose your brand first. Your configurator will then show only the options that apply to that vehicle family.
        </p>

        <div className="build-start__grid">
          {BRANDS.map((brand) => (
            <button
              type="button"
              className="build-brand-card"
              key={brand.id}
              onClick={() => nav(`/configure?brand=${brand.id}`)}
            >
              <div className="build-brand-card__media">
                <img src={brand.image} alt={`${brand.id} custom steering wheel`} />
                <span className="build-brand-card__badge">{brand.eyebrow}</span>
                <span className="build-brand-card__corner" aria-hidden="true" />
              </div>

              <div className="build-brand-card__content">
                <div>
                  <div className="build-brand-card__fitment">{brand.fitment}</div>
                  <h2>{brand.title}</h2>
                  <p>{brand.subtitle}</p>
                </div>
                <span className="build-brand-card__action">SELECT {brand.id} <b>→</b></span>
              </div>
            </button>
          ))}
        </div>

        <div className="build-start__note">
          More vehicle brands can be added here later without changing the configurator flow.
        </div>
      </section>
    </main>
  );
}
