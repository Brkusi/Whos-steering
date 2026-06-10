-- Run this in Supabase SQL Editor to add 4 Audi preset products
-- Safe to run multiple times (ON CONFLICT DO NOTHING)

INSERT INTO products (sku, brand, name, description, base_price, stripe_color, features) VALUES
  ('AUDI-RS-SPORT-001', 'AUDI', 'RS SPORT EDITION',
   'Full Alcantara grip, RS badge, Germany tri-color stripe, magnetic paddle shifters.',
   1129.99, '#CC0000',
   '["RS Badge","Germany Tri-Color","Full Alcantara","Magnetic Paddles","Heated","Airbag Compatible"]'),
  ('AUDI-SL-CARB-001', 'AUDI', 'S LINE CARBON',
   'Classic carbon top, perforated leather sides, S badge, red single stripe.',
   1199.99, '#CC2200',
   '["S Badge","Red Stripe","Classic Carbon Top","Perf. Leather Sides","Heated","Lane Assist"]'),
  ('AUDI-RS-FORGED-001', 'AUDI', 'RS FORGED PRO',
   'Forged carbon black flakes top, Alcantara sides, RS badge, clean no-stripe finish.',
   1349.99, '#111111',
   '["RS Badge","Forged Carbon Top","Alcantara Sides","Standard Paddles","Heated","Airbag Compatible"]'),
  ('AUDI-CL-ALC-001', 'AUDI', 'CLASSIC ALCANTARA',
   'Full Alcantara build, S badge, white single stripe, outer gold trim ring.',
   999.99, '#F0F0F0',
   '["S Badge","White Stripe","Full Alcantara","Gold Outer Trim","Heated","Lane Assist"]')
ON CONFLICT (sku) DO NOTHING;

-- Also add inventory rows for these new products
INSERT INTO inventory (product_id, qty_on_hand)
SELECT id, 5 FROM products 
WHERE sku IN ('AUDI-RS-SPORT-001','AUDI-SL-CARB-001','AUDI-RS-FORGED-001','AUDI-CL-ALC-001')
ON CONFLICT DO NOTHING;
