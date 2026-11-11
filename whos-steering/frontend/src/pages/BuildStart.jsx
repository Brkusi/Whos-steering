import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { VEHICLE_MAKES, wheelMatchesVehicle } from '../lib/vehicleCompatibility';
import { hasVehicleCatalog, vehicleInquiryPath, vehicleYears } from '../lib/vehicleCatalog';
import { WHEEL_STYLES } from '../lib/wheelStyles';
import { bmwVehicleFamilies } from '../lib/bmwVehicleFamilies';
import VehicleYearModelFields from '../components/VehicleYearModelFields';
import './BuildStart.css';

const BUILD_MAKES = [...VEHICLE_MAKES, {value:'INFINITI',label:'Infiniti'}];

export default function BuildStart() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initialMake = BUILD_MAKES.some(item => item.value === params.get('brand')) ? params.get('brand') : '';
  const initialYear = vehicleYears(initialMake).includes(params.get('year')) ? params.get('year') : '';
  const [make, setMake] = useState(initialMake);
  const [year, setYear] = useState(initialYear);
  const [model, setModel] = useState(initialYear ? (params.get('model') || '').slice(0,80) : '');
  const makeRef = useRef(null);
  const yearRef = useRef(null);
  const modelRef = useRef(null);
  const nextField = make === 'INFINITI' ? 'airbag' : !make ? 'make' : !year ? 'year' : !model ? 'model' : 'wheel';
  const matchingWheels = WHEEL_STYLES.filter(wheel => (!make || wheel.brand === make) && (nextField !== 'wheel' || wheelMatchesVehicle({brand:make,vehicleYear:year,vehicleModel:model},wheel.style)));

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
            <div className={`build-start__field${nextField === 'airbag' ? 'Choose the Infiniti Q50 2014–2017 airbag cover below.' : nextField === 'make' ? ' is-next' : ''}`}>
              <label className="build-start__make-label" htmlFor="compatible-make"><span className="vehicle-field__number">01</span>Vehicle make</label>
              <select ref={makeRef} id="compatible-make" className="build-start__make-select" value={make} onChange={event => {setMake(event.target.value);setYear('');setModel('');}}>
                <option value="">Select your make</option>
                {BUILD_MAKES.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="build-start__vehicle-fields">
              {hasVehicleCatalog(make) && <VehicleYearModelFields key={make} make={make} year={year} model={model} idPrefix="build-vehicle"
                onYearChange={value => {setYear(value);setModel('');}} onModelChange={setModel}
                activeField={nextField} yearRef={yearRef} modelRef={modelRef} stepNumbers />}
            </div>
          </div>
          <div className="build-start__next-step" role="status" aria-live="polite">
            {nextField === 'airbag' ? 'Choose the Infiniti Q50 2014–2017 airbag cover below.' : nextField === 'make' ? '01  Select your make to see matching wheel styles.' :
              nextField === 'year' ? '02  Now choose your vehicle year.' :
              nextField === 'model' ? '03  Choose your model to complete the compatibility check.' :
              matchingWheels.length ? '✓  Vehicle details added. Choose a wheel style below.' : 'No online wheel styles currently match this vehicle.'}
          </div>
          {make === 'BMW' && bmwVehicleFamilies(year, model).length > 1 && <p className="build-start__generation-note">This model year spans BMW generations. We’ll confirm your wheel from its photo before building.</p>}
        </div>

        <div className="build-start__section-heading">{make === 'INFINITI' ? 'Infiniti custom options' : make ? `${BUILD_MAKES.find(item => item.value === make)?.label} wheel styles` : 'Choose a wheel style'}</div>
        {nextField === 'wheel' && !matchingWheels.length && <div className="build-start__unavailable" role="status">
          Sorry, we currently do not offer online customization for that vehicle model. Please <Link to={vehicleInquiryPath(make,year,model)}>contact us</Link> to design your wheel.
        </div>}
        {make === 'INFINITI' && <Link to="/configure/infiniti-q50-airbag" className="build-airbag-option">
          <img src="/models/infiniti-q50-airbag/leather.png" alt="Infiniti Q50 airbag" />
          <div><span>CONFIGURE AIRBAG COVERS</span><h2>Infiniti Q50 · 2014–2017</h2><p>From $169.99 · Customize leather or Alcantara, stitching and the Infiniti emblem.</p></div><b aria-hidden="true">→</b>
        </Link>}

        <div className="build-start__grid">
          {matchingWheels.map(wheel => (
            <button type="button" className="build-brand-card" key={`${wheel.brand}-${wheel.style}`} onClick={() => startBuild(wheel)}>
              <div className="build-brand-card__media">
                <img src={wheel.image} alt={`${/^(Audi|BMW)\b/.test(wheel.label) ? '' : `${BUILD_MAKES.find(item => item.value === wheel.brand)?.label} `}${wheel.label} steering wheel`} loading="lazy" />
                {(wheel.imageOverlays || (wheel.imageOverlay ? [wheel.imageOverlay] : [])).map(src => <img key={src} className="build-brand-card__overlay" src={src} alt="" aria-hidden="true" loading="lazy" />)}
                <span className="build-brand-card__badge">{BUILD_MAKES.find(item => item.value === wheel.brand)?.label}</span>
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
