# Color selection photographs

Existing photos remain unchanged. New selection photos were edited with the built-in image tool using `stitch-red.jpg` and `stripe-red.jpg` as the source images, then resized and encoded as JPEG thumbnails at their original dimensions (400 × 400 for stitching; 600 × 320 for stripes).

Sources: `whos-steering/frontend/public/stitches/stitch-red.jpg` and `whos-steering/frontend/public/stripes/stripe-red.jpg`.

New stitching variants: gold, silver, beige, tan, burgundy, teal, turquoise, magenta, lavender.
New stripe variants: the same nine colors, plus white, yellow, and gray.

## Editing prompt set

Each variant uses this prompt with its color name/hex and selected part substituted:

> Use case: precise-object-edit. Edit target: the supplied original product photograph. Copy this exact photo and change ONLY the red stitching threads / central stripe to [color] ([hex]). Preserve the source black perforated leather, stitch pattern, individual thread geometry, holes, seam location and golden-brown backdrop / carbon fiber weave, rim shape and white background, framing, crop, aspect ratio, camera angle, lighting, shadows, reflections and texture. No restyling, drawing, placeholder art, additional objects, text or labels. Keep every part except the selected thread / stripe color visually unchanged. This will be a small website color-selection photo.

Gold used the same preservation requirements with: “Create a copy of this exact photo changing ONLY the red stitching threads / central stripe to gold (#D4AF37). Do not redraw, restyle, simplify or introduce any objects. No text or labels. Output a faithful photographic color variant for a tiny website selection thumbnail.”

| Color | Reference hex |
| --- | --- |
| Gold | #D4AF37 |
| Silver | #C0C0C0 |
| Beige | #D8C3A5 |
| Tan | #C19A6B |
| Burgundy | #800020 |
| Teal | #008080 |
| Turquoise | #40E0D0 |
| Magenta | #CC00CC |
| Lavender | #B79CED |
| White | #F0F0F0 |
| Yellow | #E8B800 |
| Gray | #888888 |
