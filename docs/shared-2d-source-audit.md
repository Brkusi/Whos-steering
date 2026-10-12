# Shared 2D source audit — 2026-10-12

The published reference bundle `https://build.miamicarbondesigns.com/assets/main-CxSUKnaG.js` uses material photographs from `https://pub-c5968ff7f0184c71bc3893412ddc202a.r2.dev/wheels/` and separate stitch overlays. The source map URLs for four Mercedes selections still return 404, but the corresponding material photographs are available:

- AMG Round top/bottom Alcantara.
- Mercedes 2015 Flat bottom side perforated leather.
- Mercedes 2010 Round side smooth leather.
- Mercedes 2010 Round top/bottom perforated leather.

These selections now use their actual material photographs instead of substituting another material. Two unmodified source colors, Jet Black (`9800`, `#17181b`) and Moonlight White (`9801`, `#dcded0`), provide the texture and light/shadow response for RGB interpolation. Arbitrary storefront colors remain visual approximations; the source alpha and material pattern are preserved. Separate source stitch layers are tinted with the source renderer's luminance equation. Each source URL, byte length, and SHA-256 is recorded in the family manifest.

The same paired-photo method replaces the old chroma-threshold recoloring of six Dodge Round/Yoke top/bottom materials. Neutral pixels now respond to selected colors, including white, while retaining actual smooth, perforated, and Alcantara texture. The published Dodge configuration explicitly declares `stitchColour:false` and `stitched:[]` for every rim shape. It publishes no adjustable top/bottom stitch layer; that limitation remains. Existing side-map stitching behavior has not been removed.

Saved unsupported or missing shapes now resolve to a supported family shape before requesting assets, and preview labels and LED eligibility use the resolved shape.

Validation: 20 tests passed across shared configuration, compositor, and vehicle compatibility. Asset-hash tests cover all new downloaded assets. Native Canvas rendering visually checked nine Mercedes combinations (three affected styles with dark, light, red material and blue stitching), plus all six Dodge Round/Yoke top materials in red. Three overlapping renders using one Mercedes compositor exactly matched separately rendered PNG buffers; composition canvases are local to each render, and React's version guard already suppresses stale results.

The full smoke audit rendered 98 supported leather/classic-carbon/forged-carbon combinations across all shapes of BMW F-Series, BMW G-Series Pre LCI, Audi B9.5, Supra, Porsche 992, all three Mercedes styles, and Dodge. It exposed a pre-existing luminance-mask defect: dark carbon texture in the base photograph cut holes in replacement leather. The affected Audi B9.5 flat-flat, BMW G-Series flat-round, and Mercedes 2015 flat-flat/yoke now supplement the silhouette with their verified transparent rim-photo alpha. Exterior and spoke cutouts remain transparent; a regression checks dark rim coverage and open background. This repair is deliberately scoped because other source carbon files contain opaque rectangular backing. All 98 combinations were re-rendered and visually inspected after repair.
