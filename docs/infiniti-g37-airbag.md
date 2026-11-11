# Infiniti G37 airbag configurator

Route: `/configure/infiniti-g37-airbag`. Third cover card under Infiniti on `/build?brand=INFINITI`. Uses its own product ID `infiniti-g37`, artwork, local-storage key and G37 cart/checkout identity. No model-year range was supplied, so none is advertised or inferred; serialized vehicleYear is empty. Server validates the exact G37 fitment and prices all finishes independently of the browser amount.

Same options and prices as Q50 covers: $169.99 base; carbon variants +$19.99; Bluetooth-controlled animated RGB LED +$79.99. The preview top-right corner shows the red SALE tag, original $249.99 crossed out and From $169.99. Shared material/body/thread/emblem palettes, review, cart and checkout are retained.

## Artwork and prompts

Built-in imagegen produced transparent neutral assets, copied unchanged to:
- `whos-steering/frontend/public/models/infiniti-g37-airbag/leather.png`
- `whos-steering/frontend/public/models/infiniti-g37-airbag/suede-surface.png`

The supplied blue, yellow-stitched and red-stitched leather photographs were geometry references. The two supplied black suede photographs were material references. Generated artwork is reference-based visualization, not an engineering scan.

Prompt set:
1. Product-mockup: precise Infiniti G37 cover, neutral charcoal fine-grain leather, symmetric straight-on view, wide gently bowed top and rounded shoulders, sides tapering inward into the distinctive short narrow flat-bottomed stem. Two light-gray stitch rows continuously across top and down the sides to stem. Authentic silver-gray carbon Infiniti emblem and two upholstery openings; two small molded horn icons flanking emblem and lower centered SRS AIRBAG. Full silhouette, transparent alpha, no extra bottom horn, background, wheel, hands, wires, cast shadows or watermark.
2. Precise-object-edit: generated leather is exact target; supplied Alcantara photographs are material-only references. Preserve exact canvas, framing, cover position, silhouette, stem, shape and lighting. Replace surface with continuous fine short charcoal Alcantara nap. Remove emblem/recess, seams/stitches, SRS AIRBAG and both horns to make an uninterrupted material layer. No leather grain, coarse fibers, tiled patches, large clouds, extra shadows or background. Preserve transparency.

Runtime G37 masks are registered to the 1301 × 1209 leather master: emblem with both openings subtracted, measured stitch corridors (including top), SRS text and two separate horn relief regions. The material-only layer supplies suede; alpha, seams and embossing come from the master. LED bevel uses the same product-specific emblem mask. The mobile artboard contains taller covers below the sale row without an internal scrollbar.

## Validation

27 frontend suites / 130 tests and 35 backend tests passed. Tests cover G37 price parity, distinct serialized fitment, invalid cross-fitments, shared cart and checkout, and all three brand cards. Production build and SEO prerender passed. Browser checked white leather, blue suede, both horn marks and SRS text, red stitching, animated LED and 390px mobile layout/review with Bluetooth notice. No live order or payment created.
