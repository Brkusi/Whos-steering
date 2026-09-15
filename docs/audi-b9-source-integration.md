# Audi B9 source-model integration

The B9 configurator renders the approved source GLB locally through Three.js. Other wheel styles retain their existing previews. Option labels, palettes, descriptions, order data, prices, validation, cart/checkout, and saved-build format are unchanged.

## Mapping

| Existing site option | Preview |
| --- | --- |
| Standard | Source Comfort geometry |
| Sport | Source Sport geometry |
| Smooth Leather | Source Leather material/mesh |
| Classic Carbon | Source Carbon Fiber material/mesh |
| Forged Carbon | Source Forged Carbon material/mesh |
| Alcantara / Perforated Leather | Corresponding source materials/meshes |
| Honeycomb Carbon | Existing `/HoneyComb.jpeg` catalog swatch on source carbon geometry |
| Plastic Trim Color | Button/spoke surround borders, lower insert border, outer airbag ring |
| Inner Trim Color | Lower U-shaped insert; optional top/bottom carbon match |
| Stitch Color | Wheel stitching |
| Airbag Stitch Color | Both independent cover seam meshes |
| Audi Logo Color | Audi rings, independently of the surround |
| Lower Badge RS / S | Corresponding source badge |
| Lower Badge R8 | Separate approximate R8 badge |
| Magnetic paddles, Short / Long | Separate approximate carbon blades |
| LED Display Strip | Separate approximate curved display based on the existing site's reference image; static illustrative readout |

The site palettes remain the source of color values. Classic black/forged classic preserve the original fiber image rather than multiplying it almost black; other carbon choices tint the fiber while preserving its black weave. Custom CSS colors override palette selections. Unrenderable free-text instructions remain in the order and use the existing preview notice. Turning the cover upgrade off suppresses stale custom cover values without changing the order.

## Model provenance

Approved model: `https://torqdcarbon.com/cdn/shop/3d/models/o/82b99882fc6fb4ae/volante-definitivo_compressed-_2_.glb?v=0`

Source SHA-256: `970dc316a3867155beef21af11c8e818ef5b4be05e06e34bfffa91d168001bc0`.

The deployed GLB is stored as 14 static chunks and joined in memory before parsing. Their concatenated bytes are identical to the reviewed source. The 41 source meshes retain their geometry, transforms, textures, and original UVs. The untextured lower insert gets additional planar UVs in memory to support the site's existing carbon-match option; its vertices and normals are unchanged. Materials are cloned per primitive for independent configuration. Source studio HDR lighting and exposure 2.2 are preserved. Emissive intensity is normalized to match the approved preview/source viewer.

The LED display, magnetic paddles, and R8 badge are explicitly separate approximations because they are absent from the approved source. The honeycomb finish uses the site's existing swatch rather than renaming the material. Heating, lane assistance, and airbag unit inclusion retain their order behavior without invented visual changes.

## Validation

- 16 passing frontend tests: all Standard/Sport material combinations, original palette values, stripe variants, saved/custom color precedence, cover resets, badge visibility, and existing experience tests.
- Production build succeeds.
- All five customization sections' text was compared directly against the live site and matched unchanged.
- Desktop: source loading, style/material/color changes, source and additional badges, LED/paddles, independent airbag material/color/stitch/logo, and camera controls.
- 390 × 844 mobile: pinned model, responsive controls, step navigation, no horizontal overflow.
- The model is lazy loaded only for Audi B9. Style/color changes update in place. GPU resources, listeners, observers, requests, and pending frames are cleaned up on unmount. Rendering runs on interaction/change rather than continuously.

Implementation lives in `frontend/src/components/B9ModelPreview.jsx`, `frontend/src/lib/audiB9SourceModel.js`, `audiB9Configuration.js`, `audiB9Extras.js`, and `public/models/audi-b9/v4/`.
