# Guided configurator

Wheel and Infiniti airbag configurators show one feature at a time. Back/Next preserves parent-owned choices. Edit a feature allows direct revisiting, and conditional features follow the selected wheel shape and airbag finish. Wheel validation checks the current feature when advancing and sends final review to the feature needing attention.

The catalog ambient-lighting card uses the same card background, image proportions, heading size and action spacing as the surrounding catalog.

## Transparent stripe artwork

Built-in image generation background extraction produced `whos-steering/frontend/public/stripes/rim-transparent.png` from the existing no-stripe photo. It has a genuine alpha channel. `StripeSwatch.jsx` shares this photographic base across all stripe colors and masks the colored bands to the rim silhouette.

Prompt:

> Use case: background-extraction. Edit target: this close-up photograph of a curved carbon-fiber steering-wheel rim without a center stripe. Remove ONLY the entire white background above and below the curved rim. Preserve the real carbon weave, exact curved silhouette, photographed gloss and proportions. Keep full original composition and 600:336 aspect ratio. Output genuine alpha transparency with empty space outside the rim, no white halo, no checkerboard, no backdrop, no added stripe, no added text, no shadows, no redesign. This will be used as the shared photographic base for color-selectable 12 o'clock stripe swatches.

Validation: 33 frontend suites / 155 tests passed, including feature navigation, preserved choices, conditional shape features, required-photo routing, and existing pricing/cart tests. Production build and SEO prerender checked separately.
