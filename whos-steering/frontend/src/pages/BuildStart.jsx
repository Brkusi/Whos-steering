import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { VEHICLE_MAKES } from '../lib/vehicleCompatibility';
import { hasVehicleCatalog, vehicleYears } from '../lib/vehicleCatalog';
import { WHEEL_STYLES } from '../lib/wheelStyles';
import VehicleYearModelFields from '../components/VehicleYearModelFields';
import './BuildStart.css';

export default function BuildStart() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initialMake = VEHICLE_MAKES.some(item => item.value === params.get('brand')) ? params.get('brand') : '';
  const initialYear = vehicleYears(initialMake).includes(params.get('year')) ? params.get('year') : '';
  const [make, setMake] = useState(initialMake);
  const [year, setYear] = useState(initialYear);
  const [model, setModel] = useState(initialYear ? (params.get('model') || '').slice(0,80) : '');
  const makeRef = useRef(null);
  const yearRef = useRef(null);
  const modelRef = useRef(null);
  const nextField = !make ? 'make' : !year ? 'year' : !model ? 'model' : 'wheel';

  useEffect(() => {
    const target = nextField === 'make' ? makeRef.current : nextField === 'year' ? yearRef.current : nextField === 'model' ? modelRef.current : null;
    target?.focus({preventScroll:true});
  }, [make, year, model, nextField]);

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

        <div className="build-start__compatibility" aria-label="Check vehicle compatibility">
          <div className="build-start__compatibility-heading">
            <div><span className="build-start__compatibility-mark">✓</span><span>CHECK VEHICLE COMPATIBILITY</span></div>
            <p>Tell us what you drive. We’ll confirm final fitment from your wheel photo.</p>
          </div>
          <div className="build-start__compatibility-fields">
            <div className={`build-start__field${nextField === 'make' ? ' is-next' : ''}`}>
              <label className="build-start__make-label" htmlFor="compatible-make"><span className="vehicle-field__number">01</span>Vehicle make</label>
              <select ref={makeRef} id="compatible-make" className="build-start__make-select" value={make} onChange={event => {setMake(event.target.value);setYear('');setModel('');}}>
                <option value="">Select your make</option>
                {VEHICLE_MAKES.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="build-start__vehicle-fields">
              {hasVehicleCatalog(make) && <VehicleYearModelFields key={make} make={make} year={year} model={model} idPrefix="build-vehicle"
                onYearChange={value => {setYear(value);setModel('');}} onModelChange={setModel}
                activeField={nextField} yearRef={yearRef} modelRef={modelRef} stepNumbers />}
            </div>
          </div>
          <div className="build-start__next-step" role="status" aria-live="polite">
            {nextField === 'make' ? '01  Select your make to see matching wheel styles.' :
              nextField === 'year' ? '02  Now choose your vehicle year.' :
              nextField === 'model' ? '03  Choose your model to complete the compatibility check.' :
              '✓  Vehicle details added. Choose a wheel style below.'}
          </div>
        </div>

        <div className="build-start__section-heading">{make ? `${VEHICLE_MAKES.find(item => item.value === make)?.label} wheel styles` : 'Choose a wheel style'}</div>
        <div className="build-start__grid">
          {WHEEL_STYLES.filter(wheel => !make || wheel.brand === make).map(wheel => (
            <button type="button" className="build-brand-card" key={`${wheel.brand}-${wheel.style}`} onClick={() => startBuild(wheel)}>
              <div className="build-brand-card__media">
                <img src={wheel.image} alt={`${wheel.label.startsWith('Audi') ? '' : `${VEHICLE_MAKES.find(item => item.value === wheel.brand)?.label} `}${wheel.label} steering wheel`} loading="lazy" />
                <span className="build-brand-card__badge">{VEHICLE_MAKES.find(item => item.value === wheel.brand)?.label}</span>
                <span className="build-brand-card__corner" aria-hidden="true" />
              </div>
              <div className="build-brand-card__content">
                <div>
                  <div className="build-brand-card__fitment">{wheel.detail}</div>
                  <h2>{wheel.label} Style</h2>
                  <p>From ${wheel.price.toFixed(2)}</p>
                  <p className="build-brand-card__timeline">⏱ 3–5 week custom build</p>
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
