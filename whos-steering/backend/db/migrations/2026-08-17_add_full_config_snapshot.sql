-- WHO'S STEERING
-- Preserve the complete configurator snapshot for Review/Admin order details.
-- Run this ONCE on the existing production PostgreSQL database before deploying
-- the updated checkout.js.

ALTER TABLE wheel_configurations
  ADD COLUMN IF NOT EXISTS config_json JSONB NOT NULL DEFAULT '{}'::jsonb;