# Guided configurator

Wheel and Infiniti airbag configurators show one feature at a time. Back/Next preserves parent-owned choices. Edit a feature allows direct revisiting, and conditional features follow the selected wheel shape and airbag finish. Wheel validation checks the current feature when advancing and sends final review to the feature needing attention.

The catalog ambient-lighting card uses the same card background, image proportions, heading size and action spacing as the surrounding catalog.

## Transparent stripe artwork

Built-in image generation background extraction produced `whos-steering/frontend/public/stripes/rim-transparent.png` from the existing no-stripe photo. It has a genuine alpha channel. `StripeSwatch.jsx` shares this photographic base across all stripe colors and masks the colored bands to the rim silhouette.

Prompt:

> Use case: background-extraction. Edit target: this close-up photograph of a curved carbon-fiber steering-wheel rim without a center stripe. Remove ONLY the entire white background above and below the curved rim. Preserve the real carbon weave, exact curved silhouette, photographed gloss and proportions. Keep full original composition and 600:336 aspect ratio. Output genuine alpha transparency with empty space outside the rim, no white halo, no checkerboard, no backdrop, no added stripe, no added text, no shadows, no redesign. This will be used as the shared photographic base for color-selectable 12 o'clock stripe swatches.

Validation: 33 frontend suites / 155 tests passed, including feature navigation, preserved choices, conditional shape features, required-photo routing, and existing pricing/cart tests. Production build and SEO prerender checked separately.

## Compatibility and fixed mobile configuration

Audi model-family options include all A, S and RS families for every year from 2010 through the current year (minimum 2026). These are family choices rather than US-only model-production-year filtering. Audi A/S/RS families can select all four Audi wheel styles; matching results and cards show a green check and Compatible label. Existing non-Audi fitment rules are retained. The vehicle selectors and option lists use the configurator's dark theme.

Desktop wheel features scroll inside their panel, with navigation in its own row. Mobile configuration locks the document while retaining site navigation, keeps progress/preview/total/navigation visible, and scrolls only the build feature. The document lock is removed on resize to desktop or when leaving the configurator. Review uses the same panel, preventing overlap with the save-build form.

Validation: 161 frontend tests; production build and 47 SEO prerenders. Browser QA checked desktop review and 390px mobile Audi/BMW layouts; internal panel scroll leaves document scroll at zero.

## Audi Urus paddles and larger previews

The configurator confirms `✓ Your vehicle is compatible` after a matching year/model selection. Mobile preview space is larger; the B9 camera fits visible model vertices, and 2D canvases trim empty margins with padding. Mobile G-Series LCI and R8 previews use a single front view.

Urus paddles are Audi-only, including restored builds and checkout validation. Finishes: Red, Blue, Yellow, Black, Silver, Green, Carbon Fiber, Red Carbon Fiber, Forged Carbon Fiber, Red Forged Carbon Fiber and Blue Forged Carbon Fiber. Selection values remain in review, cart, saved builds and checkout.

The shared Urus outline was traced from the customer's November 17 photographs (2.02.59–2.06.59 PM screenshots, S0fbc2a3195ee4022a70df876bd786a16I.jpg.avif, installed Audi photo 72DD7BF8634A48F2624A10825EFAD7C0.jpg, and carbon-fiber clipboard photo 0eac5abb-3b53-457f-b057-c1d9784424d4.png). Code-native 3D geometry has two open windows, mirrored plus/minus marks, bevelled edges and a covered rear mounting switch. The other Audi previews share its 2D silhouette behind photographed spokes. Existing carbon photographs provide finish maps; red/blue forged chips follow the supplied references. These previews are visual approximations rather than manufacturing CAD.

The mounted orientation flips each loose-paddle outline for the driver-facing view and reduces the blade dimensions by 15%, following the customer's orientation and size correction. 3D front faces preserve finish color under the source HDR lighting; bevels and the rear housing remain lit 3D geometry.
