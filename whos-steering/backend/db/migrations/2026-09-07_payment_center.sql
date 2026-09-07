BEGIN;
ALTER TABLE wheel_configurations DROP CONSTRAINT IF EXISTS wheel_configurations_brand_check;
ALTER TABLE wheel_configurations ADD CONSTRAINT wheel_configurations_brand_check CHECK(brand IN ('BMW','AUDI','INFINITI'));
ALTER TABLE payments ALTER COLUMN stripe_payment_intent DROP NOT NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'stripe';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paypal_order_id TEXT UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT UNIQUE;
CREATE TABLE IF NOT EXISTS paypal_refund_requests (
  request_id TEXT PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
  reason TEXT NOT NULL,
  note TEXT NOT NULL,
  admin_id UUID REFERENCES customers(id),
  provider_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'submitting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS paypal_refunds_payment ON paypal_refund_requests(payment_id);
COMMIT;
