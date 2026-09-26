# BMW F-Series source configurator integration

The F-Series preview uses the supplied site's actual 2D wheel assets, calibrated material renderer, and layer order. It does not approximate the wheel with procedural 3D geometry. The reference is https://build.miamicarbondesigns.com/#/car/bmw-fseries.

## What is included

- Exact source images for Round, Yoke, Flat top & bottom, and Flat bottom, with matching shape selection cards.
- The source's five paddle choices: original, none, glossy carbon, matte carbon, forged carbon. The source has no original-paddle overlay; original and none retain its unmodified base wheel, matching the reference's behavior. Legacy F-Series magnetic selections map to glossy carbon.
- Source grip maps for smooth leather, perforated leather, and Alcantara, with the source diffuse/specular/stitch coloring algorithm and BMW calibration values.
- Source lower-trim, airbag cover/logo, marker and flat-bottom LED layers.
- Existing Who's Steering palettes, custom color fields, checkout and saved-build workflow. The reference's extra 77-color palette is not imported. Existing honeycomb remains available.
- Classic and Forged Carbon top/bottom prints use the B9's actual embedded images, as requested. They are projected through the source carbon masks with source shading/highlights. The shape, buttons, center, paddles and other source images remain unchanged. These requested print/color substitutions mean the corresponding pixels intentionally differ from the reference.
- The source only supports an RPM display for Flat bottom; other shapes clear and hide that option. Yoke also clears/hides the top stripe.
- Shape and lower trim are included in review/admin details and persist in the existing full configuration snapshot; no database migration is needed.

## Prices

Existing storefront base, material and paddle upgrade prices remain in use. The three carbon paddle finishes use the existing $25 paddle upgrade rule. The added carbon lower-trim choices use the reference's $50 surcharge, overridable through `bmw_lower_trim`. Frontend and backend both calculate these upgrades. Shapes have no surcharge.

## Asset provenance

54 WebP files were copied from `https://build.miamicarbondesigns.com/wheels/bmw/`. `public/models/bmw-fseries/source/manifest.json` records every URL, byte count and SHA-256 hash. The tests verify the copied bytes. Failed optional thumbnail/original-paddle URLs are not included or requested by the deployed code; cards use the complete source shape images.

The calibration object and pure material renderer were extracted from the reference's `assets/main-CfGkFKrR.js`. Only rendering code was retained: no third-party payment, analytics, customer data, or order code was copied. Material images are composited in the same order as the reference, including its `lighten` paddle blend.

`classic.webp` and `forged.webp` are byte-for-byte extracted images 2 and 3 of the already-deployed Audi B9 GLB. They are not regenerated textures.

## Runtime and verification

The preview lazy-loads, caches a bounded number of source/color layers, ignores stale async results, clears caches on unmount, and provides loading/error/retry states plus zoom. It uses Canvas 2D and does not load Three.js for F-Series. Mobile keeps a compact preview pinned above the controls.

- Production build passes.
- 22 frontend tests pass: asset integrity and complete shape/material coverage, source color/stitch/alpha behavior, option mapping, existing palettes, pricing, and the existing Audi/site tests.
- Three targeted backend tests pass, including paddle/trim pricing and existing checkout option checks.
- Browser checks cover the original wheel, yoke and flat profiles, carbon prints/paddles, loading and responsive presentation.

The local static preview has no backend API; no payment, saved-build email, upload, or production order was submitted during testing.
