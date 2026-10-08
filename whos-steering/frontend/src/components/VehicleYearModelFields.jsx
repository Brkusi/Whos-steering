import { useEffect, useRef, useState } from 'react';
import { vehicleModels, vehicleYears } from '../lib/vehicleCatalog';

const OTHER = '__other__';

export default function VehicleYearModelFields({ make, year, model, onYearChange, onModelChange, idPrefix, errors = {}, required = false, activeField, yearRef, modelRef, stepNumbers = false }) {
  const [otherSelected, setOtherSelected] = useState(false);
  const manualRef = useRef(null);
  const years = vehicleYears(make);
  const validYear = years.includes(String(year));
  const models = vehicleModels(make, year);
  const manual = otherSelected || Boolean(model && !models.includes(model));
  const modelSelection = manual ? OTHER : model || '';
  useEffect(() => { if (otherSelected) manualRef.current?.focus(); }, [otherSelected]);

  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))',gap:10,marginBottom:12}}>
      <div className={`vehicle-field${activeField === 'year' ? ' is-next' : ''}`}>
        <label className="fl" htmlFor={`${idPrefix}-year`}>{stepNumbers && <span className="vehicle-field__number">02</span>}Year {required && <span className="req">*</span>}</label>
        <select ref={yearRef} id={`${idPrefix}-year`} className={`fi${errors.year ? ' error' : ''}`} value={year || ''}
          onChange={event => {setOtherSelected(false);onYearChange(event.target.value);}}>
          <option value="">Select year</option>
          {year && !validYear && <option value={year} disabled>{year} · outside current range</option>}
          {years.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        {errors.year && <div className="err-msg">Select a year</div>}
      </div>
      <div className={`vehicle-field${activeField === 'model' ? ' is-next' : ''}`}>
        <label className="fl" htmlFor={`${idPrefix}-model`}>{stepNumbers && <span className="vehicle-field__number">03</span>}Model {required && <span className="req">*</span>}</label>
        <select ref={modelRef} id={`${idPrefix}-model`} className={`fi${errors.model ? ' error' : ''}`} value={modelSelection}
          disabled={!validYear} onChange={event => {
            const value=event.target.value;
            setOtherSelected(value===OTHER);
            onModelChange(value===OTHER?'':value);
          }}>
          <option value="">Select model</option>
          {models.map(item => <option key={item} value={item}>{item}</option>)}
          <option value={OTHER}>My model isn't listed</option>
        </select>
        {manual && <input ref={manualRef} aria-label="Enter your vehicle model" className={`fi${errors.model ? ' error' : ''}`}
          value={model || ''} onChange={event => onModelChange(event.target.value)}
          placeholder="Enter your model" style={{marginTop:8}} />}
        {errors.model && <div className="err-msg">Select or enter a model</div>}
      </div>
    </div>
  );
}
