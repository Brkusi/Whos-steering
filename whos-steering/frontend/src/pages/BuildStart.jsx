import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { VEHICLE_MAKES } from '../lib/vehicleCompatibility';
import { hasVehicleCatalog } from '../lib/vehicleCatalog';
import { WHEEL_STYLES } from '../lib/wheelStyles';
import VehicleYearModelFields from '../components/VehicleYearModelFields';
import './BuildStart.css';

export default function BuildStart() {
  const nav = useNavigate();
  const [make, setMake] = useState('');
  const [year, setYear] = useState('');
  const [model, setModel] = useState('');

  const startBuild = wheel => {
    const query = new URLSearchParams({brand:wheel.brand,style:wheel.style});
    if (make === wheel.brand && year) query.set('year',year);
    if (make === wheel.brand && model) query.set('model',model);
    nav(`/configure?${query}`);
  };

  return (
    <main className="build-start">
      <section className="build-start__inner">
        <div className="build-start__eyebrow">START YOUR BUILD</div>
        <h1 className="build-start__title">SELECT YOUR VEHICLE BRAND<span>.</span></h1>
        <p className="build-start__intro">Check your vehicle, then choose the wheel style you want to configure.</p>

        <div className="build-start__compatibility">
          <div>
            <label className="build-start__make-label" htmlFor="compatible-make">Check vehicle compatibility</label>
            <select id="compatible-make" className="build-start__make-select" value={make} onChange={event => {setMake(event.target.value);setYear('');setModel('');}}>
              <option value="">Select your vehicle make</option>
              {VEHICLE_MAKES.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="build-start__vehicle-fields">
            {hasVehicleCatalog(make) && <VehicleYearModelFields key={make} make={make} year={year} model={model} idPrefix="build-vehicle"
              onYearChange={value => {setYear(value);setModel('');}} onModelChange={setModel} />}
          </div>
        </div>

        <div className="build-start__section-heading">{make ? `${VEHICLE_MAKES.find(item => item.value === make)?.label} wheel styles` : 'Choose a wheel style'}</div>
        <div className="build-start__grid">
          {WHEEL_STYLES.filter(wheel => !make || wheel.brand === make).map(wheel => (
            <button type="button" className="build-brand-card" key={`${wheel.brand}-${wheel.style}`} onClick={() => startBuild(wheel)}>
              <div className="build-brand-card__media">
                <img src={wheel.image} alt={`${wheel.brand} ${wheel.label} steering wheel`} loading="lazy" />
                <span className="build-brand-card__badge">{VEHICLE_MAKES.find(item => item.value === wheel.brand)?.label}</span>
                <span className="build-brand-card__corner" aria-hidden="true" />
              </div>
              <div className="build-brand-card__content">
                <div>
                  <div className="build-brand-card__fitment">{wheel.detail}</div>
                  <h2>{wheel.label} Style</h2>
                  <p>From ${wheel.price.toFixed(2)}</p>
                </div>
                <span className="build-brand-card__action">CONFIGURE <b>→</b></span>
              </div>
            </button>
          ))}
        </div>
        <div className="build-start__note">Final fitment is confirmed from a photo of your current wheel.</div>
      </section>
    </main>
  );
}
