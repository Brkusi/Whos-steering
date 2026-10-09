INSERT INTO pricing_rules (rule_key, description, amount) VALUES
  ('base_toyota_gr', 'Toyota Supra GR custom base price', 699.99),
  ('base_porsche_911', 'Porsche 911 custom base price', 899.99),
  ('base_dodge_srt', 'Dodge SRT custom base price', 699.99)
ON CONFLICT (rule_key) DO NOTHING;
