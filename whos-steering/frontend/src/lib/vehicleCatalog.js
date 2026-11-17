import catalog from './vehicleModels.json';

export const vehicleCatalogSource = catalog.source;
export const vehicleCatalogRetrievedOn = catalog.retrievedOn;

export const hasVehicleCatalog = make => Boolean(catalog.makes[make]);

// Audi fitment uses model families rather than a US-only production-year list.
const audiFamilies = [...new Set([
  ...Object.values(catalog.makes.AUDI.modelsByYear).flat().filter(model => /^(?:A|S|RS)/.test(model)),
  'A1','A2','S1','S2','RS 2','RS 4','RS 6','RS Q3',
])].sort((a,b) => a.localeCompare(b,undefined,{numeric:true}));

export function vehicleYears(make) {
  if (make === 'AUDI') return Array.from({length: Math.max(2026,new Date().getFullYear())-2009},(_,i)=>String(Math.max(2026,new Date().getFullYear())-i));
  const years = catalog.makes[make]?.modelsByYear;
  return years ? Object.keys(years).sort((a, b) => Number(b) - Number(a)) : [];
}

export function vehicleModels(make, year) {
  if (make === 'AUDI' && vehicleYears(make).includes(String(year))) {
    return [...new Set([...audiFamilies,...(catalog.makes.AUDI.modelsByYear[String(year)] || [])])].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  }
  return catalog.makes[make]?.modelsByYear[String(year)] || [];
}

export function vehicleInquiryPath(make, year, model) {
  const query = new URLSearchParams();
  if (make) query.set('brand', make);
  if (year) query.set('year', year);
  if (model) query.set('model', model);
  return `/contact${query.toString() ? `?${query}` : ''}`;
}
