# BMW model-year wheel filtering

The storefront asks for make, model year, and model. It does not ask customers to identify a chassis code. `bmwVehicleFamilies.js` maps BMW's US model names to E9x, F, or G platform families, then offers:

| Identified family | Online styles |
| --- | --- |
| E90/E91/E92/E93 3 Series | F-Series |
| F-code models | F-Series, G-Series LCI, G-Series Pre LCI |
| G-code models | G-Series LCI, G-Series Pre LCI |
| Other or unknown codes | Contact for a custom design |

This is a **style availability filter**, not a promise that one physical wheel or airbag interchanges across every model. Final fitment remains subject to the customer's current-wheel photo. BMW lists both E9x coupes/convertibles and F30 sedans in the 2012–13 3 Series years, so those model/year combinations show the union of possible styles and a photo-review note. The 2018–19 640i xDrive name also spans F-code Gran Coupes and the G32 Gran Turismo, so both generations remain possible. Newer compact X1/X2 vehicles use U-codes, while i3/i8/iX use i-codes, so they are not presented as F or G just because of their model year.

Primary BMW references used for the US-year boundaries and codes:

- [E90/E91/E92/E93 and F30/F31/F34 3 Series generations](https://www.press.bmwgroup.com/latin-america-caribbean/article/attachment/T0241003EN/335373), [2014 US 3 Series coupe/convertible phase-out](https://www.press.bmwgroup.com/usa/article/detail/T0151024EN_US/2014-model-year-changes), and [2019 G20 US launch](https://www.press.bmwgroup.com/usa/article/detail/T0285572EN_US/the-all-new-2019-bmw-3-series).
- [BMW Leipzig model-code production list](https://www.press.bmwgroup.com/deutschland/article/detail/T0448360DE/jubilaeum%3A-20-jahre-serienproduktion-im-bmw-group-werk-leipzig) for E82, F22, F44, F87, i3, and i8; [2022 G42 2 Series](https://www.press.bmwgroup.com/usa/article/detail/T0337210EN_US/the-new-2022-bmw-2-series-coupe) and [2023 G87 M2](https://www.press.bmwgroup.com/usa/article/detail/T0404581EN_US/the-all-new-bmw-m2-purebred-driving-pleasure-intensely-concentrated).
- [2021 G22 4 Series](https://www.press.bmwgroup.com/usa/article/detail/T0309161EN_US/the-new-2021-bmw-4-series-coupe); [F10/G30 5 Series history](https://www.press.bmwgroup.com/asia/article/attachment/T0422286EN/588882), [2024 G60 5 Series](https://www.press.bmwgroup.com/usa/article/detail/T0418778EN_US/the-all-new-2024-bmw-5-series), and [F10/F90 M5 history](https://www.press.bmwgroup.com/usa/article/detail/T0273727EN_US/the-all-new-2018-bmw-m5%3A-the-quintessential-high-performance-sedan).
- [2018 US 6 Series model list](https://www.press.bmwgroup.com/usa/article/detail/T0271729EN_US/model-year-2018-update-information), [2018 G32 640i xDrive Gran Turismo](https://www.press.bmwgroup.com/usa/article/detail/T0271687EN_US/the-all-new-2018-bmw-6-series-gran-turismo), and [BMW USA legacy 6 Series model-year reference](https://www.bmwusa.com/legacy-vehicles/6-series.html).
- [F01/F02 and G11/G12 7 Series](https://www.press.bmwgroup.com/latin-america-caribbean/article/attachment/T0241003EN/335373); [X1 E84/F48](https://www.press.bmwgroup.com/usa/article/detail/T0220582EN_US/the-all-new-bmw-x1) and [2023 U11 X1](https://www.press.bmwgroup.com/usa/article/detail/T0394853EN_US/the-all-new-2023-bmw-x1); [2018 F39 X2](https://www.press.bmwgroup.com/usa/article/detail/T0275484EN_US/the-first-ever-2018-bmw-x2%3A-powerful-and-agile) and [2024 U10 X2](https://www.press.bmwgroup.com/canada/article/detail/T0437628EN/the-all-new-2024-bmw-x2).
- [2018 G01 X3](https://www.press.bmwgroup.com/usa/article/detail/T0272041EN_US/the-all-new-2018-bmw-x3), [2019 G02 X4](https://www.press.bmwgroup.com/usa/article/detail/T0278479EN_US/the-all-new-2019-bmw-x4-the-eye-catching-athlete), [2014 F15 X5](https://www.press.bmwgroup.com/usa/article/detail/T0143179EN_US/bmw-announces-pricing-for-all-new-x5-sports-activity-vehicle), [2019 G05 X5](https://www.press.bmwgroup.com/usa/article/detail/T0281821EN_US/the-all-new-2019-bmw-x5-sports-activity-vehicle), and [2020 G06 X6](https://www.press.bmwgroup.com/usa/article/detail/T0297890EN_US/the-new-2020-bmw-x6-sports-activity-coupe).

The `vehicleModels.json` year/model choices are based on NHTSA model data. Some legacy names occur in later years than BMW's model-generation announcements. Those are left unmatched when there is no supported F or G case, and the contact route remains available.
