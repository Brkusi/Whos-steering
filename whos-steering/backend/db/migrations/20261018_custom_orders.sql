CREATE TABLE IF NOT EXISTS custom_orders (
  order_id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  stripe_session_id TEXT UNIQUE NOT NULL,
  checkout_url TEXT NOT NULL,
  checkout_expires_at TIMESTAMPTZ NOT NULL,
  email_sent_at TIMESTAMPTZ,
  email_attempts INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS custom_orders_created_at_idx ON custom_orders(created_at DESC);
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
