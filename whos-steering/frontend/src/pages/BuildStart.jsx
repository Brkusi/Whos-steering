import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { VEHICLE_MAKES } from '../lib/vehicleCompatibility';
import { hasVehicleCatalog, vehicleInquiryPath } from '../lib/vehicleCatalog';
import VehicleYearModelFields from '../components/VehicleYearModelFields';
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
    subtitle: 'RS-inspired custom steering wheels with B9, RS 2020+, and R8-style configurations.',
    image: AUDI_PRESETS.find(Boolean)?.images?.[0] || '/PRESET_1.png',
    fitment: 'Audi 2011+ · B9, RS 2020+ & R8 Styles',
  },
  {
    id: 'MERCEDES',
    eyebrow: 'MERCEDES',
    title: 'BUILD YOUR MERCEDES',
    subtitle: 'AMG Performance and Mercedes wheel styles with live shape and material previews.',
    image: '/models/mercedes-amg/source/round.webp',
    fitment: 'Mercedes 2010–2025 · Three Wheel Styles',
  },
  {
    id: 'TOYOTA',
    eyebrow: 'TOYOTA',
    title: 'BUILD YOUR TOYOTA',
    subtitle: 'Customize the Supra GR wheel with three shapes and matching materials.',
    image: '/models/supra-gr/source/flat-round.webp',
    fitment: 'Toyota Supra GR · 2020+',
  },
];

export default function BuildStart() {
  const nav = useNavigate();
  const [make, setMake] = useState('');
  const [year, setYear] = useState('');
  const [model, setModel] = useState('');

  const startBuild = brand => {
    const query = new URLSearchParams({brand});
    if (year) query.set('year',year);
    if (model) query.set('model',model);
    nav(`/configure?${query}`);
  };

  return (
    <main className="build-start">
      <section className="build-start__inner">
        <div className="build-start__eyebrow">START YOUR BUILD</div>
        <h1 className="build-start__title">SELECT YOUR VEHICLE BRAND<span>.</span></h1>
        <p className="build-start__intro">
          Choose your brand first. Your configurator will then show only the options that apply to that vehicle family.
        </p>

        <label className="build-start__make-label" htmlFor="compatible-make">Check vehicle compatibility</label>
        <select id="compatible-make" className="build-start__make-select" value={make} onChange={event => {setMake(event.target.value);setYear('');setModel('');}}>
          <option value="">Select your vehicle make</option>
          {VEHICLE_MAKES.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
        </select>

        {hasVehicleCatalog(make) && <div className="build-start__vehicle-fields">
          <VehicleYearModelFields key={make} make={make} year={year} model={model} idPrefix="build-vehicle"
            onYearChange={value => {setYear(value);setModel('');}} onModelChange={setModel} />
        </div>}

        <div className="build-start__grid">
          {BRANDS.filter(brand => !make || brand.id === make).map((brand) => (
            <button
              type="button"
              className="build-brand-card"
              key={brand.id}
              onClick={() => startBuild(brand.id)}
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

        {make && !BRANDS.some(brand => brand.id === make) && (
          <div className="build-start__unavailable" role="status">
            A configurable wheel for {VEHICLE_MAKES.find(item => item.value === make)?.label} is not available yet. <Link to={vehicleInquiryPath(make,year,model)}>Ask about fitment</Link> and our team can check your current wheel.
          </div>
        )}

        <div className="build-start__note">
          Not sure about fitment? Contact our team before starting your build.
        </div>
      </section>
    </main>
  );
}
