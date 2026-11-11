# Infiniti Q50 2014–2017 airbag configurator

Route: `/configure/infiniti-q50-airbag`. Select Infiniti under Configure, then Configure Airbag Covers → Q50 2014–2017. Infiniti custom options also link from the home brand section and catalog. No other airbag fitments are offered.
Standalone design configurator with a $169.99 base price. Regular emblem colors are included; classic or forged carbon adds $19.99; LED adds $79.99. Only one emblem surcharge applies. Build review adds an airbag-cover item to the shared cart, which persists the full configuration and proceeds through the existing Stripe/PayPal checkout. The server recognizes the dedicated product type, validates the Q50 2014–2017 fitment, and calculates its price independently of the browser amount.

Leather / Alcantara, airbag color, stitching, and emblem finish are independently controlled. Palette imports are the same production COLORS, STITCH_COLORS, CLASSIC_CARBON_COLORS, and FORGED_CARBON_COLORS used by wheel configurators. Finish changes reset to a valid color. Designs persist locally. Reset, inspect and download controls are omitted per request. Option buttons use the same shared `ob` classes as the wheel configurators, with uppercase airbag labels.

The canvas has transparent alpha. Its on-screen container uses the site's dark background. No inspect or download buttons are shown, per request.

## Artwork

Original references: six PNG images in the user-provided `Infiniti Airbags.zip`. The blue-stitch leather photograph was the geometry and SRS AIRBAG/horn master; the white-stitch Alcantara photograph supplied the suede material reference. Neutral transparent assets were prepared with the built-in imagegen tool, then reviewed against the original references. They are generated reference-based artwork, not engineering scans.

Project assets: `whos-steering/frontend/public/models/infiniti-q50-airbag/leather.png` and `suede-surface.png`. The earlier `suede-reference.png` is retained for provenance but is not loaded by the renderer.

Generation prompts:
1. Precise product cutout of the blue-stitch leather airbag. Remove carpet/background only; retain full silhouette including side tabs, original perspective, leather grain, embossed SRS AIRBAG and horn markings. Neutralize blue stitching to light gray and blue emblem to silver-gray carbon while preserving its outline, holes and reflective highlights. Standalone airbag, transparent alpha, no wheel or outside shadow.
2. Use the neutral airbag as the exact edit target and white-stitch Alcantara photo only as material reference. Replace leather grain with black suede; lock all contours, features, neutral threads, emblem and embossing. Preserve transparency and lighting.

The runtime uses one master outline and measured stitch corridors. Suede uses a single full-resolution material surface with no repeated sampling; the exact master stitch pixels and embossed relief are restored separately. The emblem mask explicitly subtracts the upholstery openings. Its lighting is low-pass filtered to prevent carbon weave from leaking into regular-color finishes. All compositing preserves master alpha.

## Validation

- Existing suite: 23 suites / 111 tests passed.
- New palette, normalization, serialization and fitment tests: 5 passed.
- Production React build passed; 44 SEO routes prerendered.
- Desktop and 390px mobile layouts checked in browser; material/finish changes and entry from Configure page checked.
- Initial compositor QA exports of pink versus red solid emblems: 44,602 changed pixels, all inside emblem bounds (495,232)–(941,444); zero changed pixels outside emblem region or in sampled inner openings; zero alpha differences; 555,435 fully transparent pixels in 1442 × 1091 exports.
- Export controls used during QA were subsequently removed as requested.

## Final material and mask correction

The user identified visible lines in the repeated suede sample and original carbon remaining at emblem edges. Replaced patch sampling with a continuous full-size material-only asset. Expanded and retraced the logo perimeter and inner rim; a raster comparison against the source found zero bright original-carbon pixels outside the updated mask in the emblem region. Solid finish was checked in browser; the upholstery openings remain uncolored.

Final suede generation prompt (built-in imagegen):
“Precise material-only texture pass for a product configurator. Image 1 supplies exact shape, framing, coordinates and lighting. Images 2 and 3 supply real Alcantara/suede material appearance. Output the same standalone airbag shape and placement as image 1 on transparent alpha, but covered entirely in realistic BLACK fine-nap automotive Alcantara, very fine soft short suede fibers, matte, subtly brushed and softly mottled like images 2 and 3. NOT leather grain, not wool, not coarse carpet, not large cloudy patches. For this special material layer REMOVE ALL logo, emblem recess, stitching, seams, lettering, SRS, AIRBAG and horn graphics: make an uninterrupted smooth suede-covered airbag surface across those locations. Details will be composited separately. Preserve exact silhouette, side tabs and form shading from image1. No lines, no stripes, no repeating tiles, no grid boundaries, no texture seams, no graphic details, no hard rectangular patches. Full surface continuous fabric with realistic microscopic irregular nap. No wheel or background. Match image1 framing and proportions exactly.”

References for this pass: the neutral leather master, purple-stitched Alcantara photo, and red-stitched Alcantara photo.

## LED and pricing update

LED uses a blue-to-purple-to-pink gradient matching the supplied November 10 reference, clipped to the same complete emblem mask. Selecting LED displays the installation wiring notice. Forged carbon uses a 160px texture repeat instead of 256px for smaller flakes. Fresh designs default to an included regular-color emblem; saved finish selections retain their choice with the corresponding price. Eight configuration and UI tests cover pricing, serialization, palettes and conditional LED notice.

The LED emblem continuously animates a seamless six-second blue/purple/pink flow, repainting only the masked badge region. Original carbon highlights are removed in LED mode so its complete face is illuminated. Suede embossing uses the master image at two blur scales to retain letter interiors and horn relief without a leather patch. The mobile wheel carousel starts playing automatically with a working Pause control. Validation: 20 focused tests and production build passed; mobile computed transforms advanced without pressing Play.

## Carbon color and cart integration

Carbon color tints the master carbon weave across the full emblem using the complete regular-color palette. It has the same $19.99 carbon surcharge. Regular Color remains smooth and included. The cart item stores the airbag product identifier, fixed fitment, material, body/stitch colors, finish, emblem color and named summary. Build review precedes adding and opens the shared cart drawer. Backend preflight rejects unsupported airbag products/finishes before opening a transaction, and the order uses the authoritative $169.99/$189.98/$249.98 price. The full snapshot remains in order configuration JSON. Tests cover the shared cart/checkout route, serialized selections, tampered price, invalid fitment, quantities and promo totals. Live payment submission is not part of QA.

## Suede relief and LED realism refinement

Removed the extra illumination-color caption from the LED notice; the requested installation wiring notice remains. Suede embossing now modulates the material luminance proportionally, bounded to retain at least 62% of the local surface luminance before tinting. This keeps SRS/AIRBAG and horn marks in the selected body hue instead of subtracting relief into near-black. The master glyph geometry is retained. LED animation adds a mask-derived rounded bevel with directional upper-left highlights, seated lower edges and a broad polished-diffuser reflection. All shading is clipped to the full existing emblem mask; there is no original carbon weave in the LED face. Blue and white suede previews were visually checked.
