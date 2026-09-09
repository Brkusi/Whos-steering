CREATE TABLE IF NOT EXISTS sales_leads (
 id text PRIMARY KEY, email text NOT NULL, kind text NOT NULL CHECK(kind IN ('build','checkout','fitment')),
 payload jsonb NOT NULL, consent boolean NOT NULL DEFAULT false, consent_version text,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '30 days',
 unsubscribed_at timestamptz, stage integer NOT NULL DEFAULT 0, last_sent_at timestamptz,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')), recovered_at timestamptz
);
CREATE INDEX IF NOT EXISTS sales_leads_email ON sales_leads(lower(email));
CREATE TABLE IF NOT EXISTS sales_events (
 id bigserial PRIMARY KEY, session_id text NOT NULL, event text NOT NULL CHECK(event IN ('configure_started','checkout_started','build_resumed')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(session_id,event)
);
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_events ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS sales_attributions (
 order_id uuid PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
 lead_id text REFERENCES sales_leads(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sales_attributions ENABLE ROW LEVEL SECURITY;
