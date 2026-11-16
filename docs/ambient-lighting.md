# Symphony Ambient Lighting

Source listing, read November 16, 2026: https://www.alibaba.com/product-detail/Smart-App-Control-Symphony-Car-Ambient_1601861488651.html

Product: `/products/symphony-ambient-lighting/`. Category: `/shop/lighting/`. Category is linked in desktop and mobile navigation. The catalog includes the product under All and Lighting.

The ten Symphony variants and their individual supplier prices were read from the listing's Select variations and quantity panel. Selling price is supplier price × 1.5, rounded to cents. The crossed-out comparison price is selling price × 1.3, rounded half up to cents. The page says SALE without a mathematically inaccurate 30% off claim. These are comparison prices supplied by the owner's pricing instruction, not verified historical selling prices.

| Kit | Supplier USD | Selling USD | Comparison USD |
| --- | ---: | ---: | ---: |
| 26 in 1 | 35.40 | 53.10 | 69.03 |
| 24 in 1 | 29.50 | 44.25 | 57.53 |
| 22 in 1-1 | 28.80 | 43.20 | 56.16 |
| 22 in 1-2 | 28.10 | 42.15 | 54.80 |
| 20 in 1 | 25.90 | 38.85 | 50.51 |
| 18 in 1 | 22.90 | 34.35 | 44.66 |
| 14 in 1-1 | 21.40 | 32.10 | 41.73 |
| 14 in 1-2 | 21.40 | 32.10 | 41.73 |
| 10 in 1 | 20.60 | 30.90 | 40.17 |
| 6 in 1 | 19.20 | 28.80 | 37.44 |

Six source gallery photographs and ten source kit photographs are stored unchanged in `frontend/public/products/ambient-lighting/`. Filename mapping follows gallery order, then variant order above. The LED hero uses view-4.jpg, the source close-up of acrylic strips. The explorer zooms the real source photo with CSS; no synthetic product details are generated. Each view has its own descriptions and focus coordinates. Reset, Escape, Next/Back and reduced motion are supported.

The supplier's key attributes identify 12V, 3–5W, acrylic/ABS+LED and 64 colors. The page explains Bluetooth app control, microphone-driven music sync and dynamic modes from the supplier description. It does not transplant Alibaba shipping, returns, reviews or certifications as merchant promises. Contents and fitment vary by kit; the selected contents photo is shown explicitly.

The cart keeps unit prices and real quantities. Identical lighting variants merge. The 100-kit limit applies across all lighting variants together, in UI, cart state and server checkout. Server pricing ignores submitted prices and does not apply the steering-wheel Black Friday reduction. Lighting uses normal order-item records with authoritative kit names and descriptions, no wheel configuration record or misleading vehicle brand. Stripe/PayPal use the common resulting server totals. No live test orders or payments were created.
