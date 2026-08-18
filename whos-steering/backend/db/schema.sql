-- WHO'S STEERING — PostgreSQL Schema
-- Run this once against your database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────
-- CUSTOMERS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  phone         TEXT,
  password_hash TEXT,            -- NULL for guest checkouts
  google_id     TEXT UNIQUE,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- PRODUCTS / CATALOG
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku          TEXT UNIQUE NOT NULL,
  brand        TEXT NOT NULL CHECK (brand IN ('BMW','AUDI')),
  name         TEXT NOT NULL,
  description  TEXT,
  base_price   NUMERIC(10,2) NOT NULL,
  stripe_color TEXT,
  features     JSONB NOT NULL DEFAULT '[]',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- INVENTORY (stock of pre-configured wheels)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  qty_on_hand INT NOT NULL DEFAULT 0,
  qty_reserved INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- WHEEL CONFIGURATIONS  (one per cart/order line)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wheel_configurations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID REFERENCES products(id),   -- NULL for fully custom
  brand           TEXT NOT NULL CHECK (brand IN ('BMW','AUDI')),
  vehicle_year    TEXT NOT NULL,
  vehicle_model   TEXT NOT NULL,
  wheel_style     TEXT NOT NULL DEFAULT 'Standard',  -- Standard | Sport
  paddle_shifters TEXT NOT NULL DEFAULT 'Standard',  -- Standard | Magnetic
  top_bottom_mat  TEXT NOT NULL,
  top_bottom_col  TEXT,
  side_mat        TEXT NOT NULL,
  side_col        TEXT,
  stripe_mode     TEXT NOT NULL DEFAULT 'none',      -- none | single | tri
  stripe_color    TEXT,
  tri_key         TEXT,                              -- 'bmw' | 'germany'
  airbag_compat   BOOLEAN NOT NULL DEFAULT TRUE,
  heated          BOOLEAN NOT NULL DEFAULT TRUE,
  lane_assist     BOOLEAN NOT NULL DEFAULT TRUE,
  audi_badge      TEXT,                              -- RS | S (AUDI only)
  outer_trim_col  TEXT,                              -- AUDI only
  inner_trim_col  TEXT,                              -- AUDI only
  photo_url       TEXT,                              -- uploaded wheel photo
  calculated_price NUMERIC(10,2) NOT NULL,
  config_json     JSONB NOT NULL DEFAULT '{}'::jsonb, -- full customer configurator snapshot
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- ORDERS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id           UUID REFERENCES customers(id),
  guest_email           TEXT,                    -- for guest checkouts
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN (
                            'pending','payment_processing','paid',
                            'in_build','quality_check','shipped',
                            'delivered','cancelled','refunded')),
  subtotal              NUMERIC(10,2) NOT NULL,
  shipping_cost         NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax                   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total                 NUMERIC(10,2) NOT NULL,
  shipping_name         TEXT,
  shipping_address1     TEXT,
  shipping_address2     TEXT,
  shipping_city         TEXT,
  shipping_state        TEXT,
  shipping_zip          TEXT,
  shipping_country      TEXT DEFAULT 'US',
  notes                 TEXT,
  estimated_ship_date   DATE,
  shipped_at            TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- ORDER LINE ITEMS
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id             UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  wheel_config_id      UUID REFERENCES wheel_configurations(id),
  product_id           UUID REFERENCES products(id),  -- for pre-configured items
  item_name            TEXT NOT NULL,
  item_detail          TEXT,
  unit_price           NUMERIC(10,2) NOT NULL,
  quantity             INT NOT NULL DEFAULT 1,
  line_total           NUMERIC(10,2) NOT NULL
);

-- ────────────────────────────────────────────
-- STRIPE PAYMENT REFERENCES
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent TEXT UNIQUE NOT NULL,
  stripe_charge_id      TEXT,
  stripe_customer_id    TEXT,
  amount                NUMERIC(10,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'usd',
  status                TEXT NOT NULL,             -- mirrors Stripe status
  receipt_url           TEXT,
  refunded_amount       NUMERIC(10,2),
  refund_reason         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- ORDER STATUS HISTORY  (audit trail)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  note        TEXT,
  changed_by  UUID REFERENCES customers(id),  -- admin user
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- PRICING RULES  (add-on pricing table)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing_rules (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_key     TEXT UNIQUE NOT NULL,   -- e.g. 'airbag_compat', 'heated_audi'
  description  TEXT NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────
INSERT INTO products (sku, brand, name, description, base_price, stripe_color, features) VALUES
  ('BMW-MSIG-001', 'BMW', 'M SPORT SIGNATURE',
   'Flat-bottom sport profile, BMW tri-color stripe, forged carbon top, Alcantara sides.',
   1349.99, '#003DA5',
   '["Flat-Bottom Sport","BMW Tri-Color","Forged Carbon","Alcantara Sides","Magnetic Paddles","Heated"]'),
  ('AUDI-RS-001', 'AUDI', 'RS EDITION',
   'RS-badged Alcantara build, Germany tri-color stripe, perforated leather sides.',
   1129.99, '#CC0000',
   '["RS Lower Badge","Germany Tri-Color","Full Alcantara","Perf. Leather Sides","Outer/Inner Trim","Heated"]'),
  ('BMW-CARB-001', 'BMW', 'CARBON SERIES',
   'Full carbon fiber grip, standard profile, black stripe, leather side grips.',
   1249.99, '#111111',
   '["Standard Profile","Carbon Fiber Top","Leather Sides","Standard Paddles","Heated","Lane Assist"]')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO pricing_rules (rule_key, description, amount) VALUES
  ('base_bmw',       'BMW custom base price',          849.99),
  ('base_audi',      'Audi custom base price',         750.00),
  ('airbag_compat',  'Airbag compatible add-on',        75.00),
  ('heated_audi',    'Heated steering (Audi only)',      25.00),
  ('paddle_magnetic','Magnetic paddle upgrade',          50.00)
ON CONFLICT (rule_key) DO NOTHING;

-- Inventory rows for pre-configured products
INSERT INTO inventory (product_id, qty_on_hand)
SELECT id, 5 FROM products WHERE sku IN ('BMW-MSIG-001','AUDI-RS-001','BMW-CARB-001')
ON CONFLICT DO NOTHING;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['customers','orders','payments','pricing_rules','inventory']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%s_updated ON %s;
      CREATE TRIGGER trg_%s_updated
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', t, t, t, t);
  END LOOP;
END $$;
