# BMW G-Series Pre LCI

Adds a separate G-Series Pre LCI category alongside G-Series and F-Series. Its Canvas 2D preview uses the actual BMW G-Series assets from https://build.miamicarbondesigns.com/#/car/bmw-gseries.

54 original WebP assets are stored under `public/models/bmw-gseries/source`, with source URLs and SHA-256 hashes in `manifest.json`. The G-Series calibration is extracted from the source renderer. The shared compositor selects each family’s own assets and clears its caches when switching families.

Includes Round, Yoke, Flat top & bottom, and Flat bottom shapes; original/none/glossy/matte/forged paddles; grip materials; lower trims; airbag covers; top markers; and the source flat-bottom LED. The source original-paddle file is absent, so original and none retain the base wheel, as on the reference. Yoke has no top marker, and only Flat bottom has LED support.

Existing store palettes remain. Carbon uses fine repeats of the selected store swatch, follows the original rim masks, and preserves colored fibers/flakes. Existing G-Series base and airbag prices remain, with the existing $25 carbon paddle and $50 lower-trim prices applied consistently in browser and checkout. Category, shape, and trim persist in the existing configuration snapshot and appear in review/admin.

Validation: production build, 24 frontend tests, and two targeted checkout pricing tests pass. Browser checks cover category switching, mobile preview, carbon, paddles, lower trim, shapes, and LED layers. No order, payment, or customer email is submitted during verification.
