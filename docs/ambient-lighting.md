# Symphony Ambient Lighting

Source listing, read November 16, 2026: https://www.alibaba.com/product-detail/Smart-App-Control-Symphony-Car-Ambient_1601861488651.html

Product: `/products/symphony-ambient-lighting/`. Category: `/shop/lighting/`. Category is linked in desktop and mobile navigation. The catalog includes the product under All and Lighting.

The ten Symphony variants and their individual supplier prices were read from the listing's Select variations and quantity panel. Current selling price: add 50% to supplier cost, add $20, then round upward to the next $5 increment. The crossed-out comparison price remains 30% above selling price. The page says SALE. Comparison prices come from the owner’s instruction and are not verified historical prices.

| Kit | Supplier USD | Selling USD | Comparison USD |
| --- | ---: | ---: | ---: |
| 26 in 1 | 35.40 | 75.00 | 97.50 |
| 24 in 1 | 29.50 | 65.00 | 84.50 |
| 22 in 1-1 | 28.80 | 65.00 | 84.50 |
| 22 in 1-2 | 28.10 | 65.00 | 84.50 |
| 20 in 1 | 25.90 | 60.00 | 78.00 |
| 18 in 1 | 22.90 | 55.00 | 71.50 |
| 14 in 1-1 | 21.40 | 55.00 | 71.50 |
| 14 in 1-2 | 21.40 | 55.00 | 71.50 |
| 10 in 1 | 20.60 | 55.00 | 71.50 |
| 6 in 1 | 19.20 | 50.00 | 65.00 |

Six source gallery photographs and ten source kit photographs are stored unchanged in `frontend/public/products/ambient-lighting/`. Filename mapping follows gallery order, then variant order above. The LED hero now uses led-transparent.png, an AI background extraction from view-4.jpg. The explorer zooms the product cutout with CSS. Each view has its own descriptions and focus coordinates. Reset, Escape, Next/Back and reduced motion are supported.

The supplier's key attributes identify 12V, 3–5W, acrylic/ABS+LED and 64 colors. The page explains Bluetooth app control, microphone-driven music sync and dynamic modes from the supplier description. It does not transplant Alibaba shipping, returns, reviews or certifications as merchant promises. Contents and fitment vary by kit; the selected contents photo is shown explicitly.

The cart keeps unit prices and real quantities. Identical lighting variants merge. The 100-kit limit applies across all lighting variants together, in UI, cart state and server checkout. Server pricing ignores submitted prices and does not apply the steering-wheel Black Friday reduction. Lighting uses normal order-item records with authoritative kit names and descriptions, no wheel configuration record or misleading vehicle brand. Stripe/PayPal use the common resulting server totals. No live test orders or payments were created.
