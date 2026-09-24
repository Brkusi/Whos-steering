ALTER TABLE customers ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  attempts SMALLINT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_codes_customer_created
  ON password_reset_codes(customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS password_reset_codes_expiry
  ON password_reset_codes(expires_at);
