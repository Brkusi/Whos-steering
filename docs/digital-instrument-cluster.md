# Audi A6/A7 Digital Instrument Cluster

Owner-supplied fitment and specifications: Audi A6/A7 2012–2018, C7 / 4G8 MLB platform. Route: `/products/audi-a6-a7-digital-instrument-cluster/`. Store card appears under All and Audi. No product price or purchase offer is emitted.

The explorer uses all eight supplied photos as transparent 2D views, each with three accessible glowing hotspot buttons, animated close-ups and floating explanations beside the selected point. The Coming Soon dot pulses; hotspot rings animate. Reset and Escape restore the full image; reduced motion is respected. On mobile the floating explanation sits below its selected point. All specifications and four theme names come from the owner's supplied description.

## Waitlist operations

`POST /api/waitlist/subscribe` validates product, name, email and explicit availability-update consent. Signups persist in `product_waitlist` with a unique product/email pair, consent date and opaque unsubscribe token. The table is created on first use if needed; database failures never confirm success and initialization can retry. Rejoining updates the existing row. No automatic email campaign is sent.

Admin → Sales → Digital Instrument Cluster waitlist → Export Waitlist downloads active signups, vehicle details, dates and individual unsubscribe links. Include each recipient's unsubscribe URL in availability emails. The URL opens a confirmation UI; pressing Unsubscribe changes the record. This audience is separate from the newsletter and orders.

## Asset provenance

Edit target: `/Users/kusi/Downloads/5164134872.jpg`. Built-in image generation tool, background-extraction mode. Final asset: `whos-steering/frontend/public/products/digital-instrument-cluster/cluster.png` (1774 × 887, RGBA, alpha 0–255).

Final prompt:

> Use case: background-extraction. Edit target: supplied photograph of automotive digital instrument cluster. Remove only the entire surrounding white/gray photo backdrop, bench, shadows and trailing power cable. Keep the complete instrument cluster, silver bezel, black housing and mounting tabs exactly as photographed. Preserve the actual screen graphics, proportions, colors and details. Center the complete product, tightly framed with a small clear margin on all sides, landscape composition. Output a clean product cutout with real alpha transparency, no background, no floor, no shadow. Do not redraw, redesign or add any part.

Original photos remain untouched. This is an AI-extracted product cutout rather than a pixel-identical manual mask.


## More features — all supplied photos

The More Features → and ← controls step through the eight views in a loop. Each change resets the close-up and loads that image’s own hotspot explanations. There is no automatic slideshow. All additional images are prefetched; the preceding photo stays visible until its replacement has loaded, with no loading message. Controls prevent interacting with a not-yet-loaded image, and failed loads offer Retry. Navigation remains available during loading.

| Source photo | Project asset | View |
| --- | --- | --- |
| 5164134872.jpg | cluster.png | Twin-dial overview |
| 5164130935.jpg | media.png | Media & controls |
| 5164281941.jpg | navigation.png | Navigation & HDMI |
| 5164289841.jpg | tracks.png | Track-style display |
| 5164301499.jpg | minimal.png | Minimal digital display |
| 5164301503.jpg | single-dial.png | Single-dial display |
| 5168332098.jpg | settings.png | Settings & connectivity |
| 5168332137.jpg | vehicle-status.png | Vehicle status & alerts |

Assets are in `whos-steering/frontend/public/products/digital-instrument-cluster/`. All new extracts use the built-in image editing tool with transparency enabled, one request per original photo, using this prompt:

> Use case: background-extraction. Edit target: the attached photograph of an Audi digital instrument cluster. Remove ONLY the entire surrounding white/gray photo backdrop, bench, shadows and trailing power cable. Preserve the complete instrument cluster including silver bezel, black housing, mounting tabs, exact screen layout, text, menu selections, gauge style and vehicle icon from THIS photograph. Do not replace the screen with another layout; the unique current screen content is essential. Preserve original proportions and photographed details. Center and tightly frame the complete product with a small clear margin, landscape approximately 2:1 canvas. Output real alpha transparency with no floor, no shadow, no added text or background. No redesign or restyling.


## Compact overview refinement

The product overview is capped at 880px, with a smaller image and a centered More Features arrow in the open notch beneath the center bezel, between the mounting tabs. Navigation is present only in the unselected overview. Opening an insight hides it; clicking anywhere outside the popup and insight selectors restores the current photo’s full view. Clicking inside the information box leaves it open. Escape, Reset View and the close button remain accessible alternatives. All photographs and the existing waitlist are retained.


Each insight has bottom-corner Back and Next arrows. They cycle through the current photo’s three hotspots, animates the corresponding close-up and wraps back to the first insight. The popup stays mounted so keyboard focus remains on the navigation control. Clicking outside still returns to the overview.

A fixed yellow Join the Waitlist call to action stays visible while browsing and exploring insights. On mobile it spans the bottom edge; on desktop it sits at bottom right with the product name. It opens and focuses the signup form, then hides to avoid covering the form. Overview size remains compact; desktop insight view has enough vertical space for its full text and corner controls.
