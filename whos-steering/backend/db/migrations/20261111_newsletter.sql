CREATE TABLE IF NOT EXISTS newsletter_subscribers (
 email text PRIMARY KEY, unsubscribe_token text NOT NULL UNIQUE,
 consent_version text NOT NULL, consent_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(), unsubscribed_at timestamptz,
 source text NOT NULL DEFAULT 'homepage'
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
