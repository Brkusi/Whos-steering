import catalog from './vehicleModels.json';

export const vehicleCatalogSource = catalog.source;
export const vehicleCatalogRetrievedOn = catalog.retrievedOn;

export const hasVehicleCatalog = make => Boolean(catalog.makes[make]);

export function vehicleYears(make) {
  const years = catalog.makes[make]?.modelsByYear;
  return years ? Object.keys(years).sort((a, b) => Number(b) - Number(a)) : [];
}

export function vehicleModels(make, year) {
  return catalog.makes[make]?.modelsByYear[String(year)] || [];
}

export function vehicleInquiryPath(make, year, model) {
  const query = new URLSearchParams();
  if (make) query.set('brand', make);
  if (year) query.set('year', year);
  if (model) query.set('model', model);
  return `/contact${query.toString() ? `?${query}` : ''}`;
}
