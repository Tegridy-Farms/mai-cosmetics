CREATE TABLE IF NOT EXISTS lead_sources (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_sources_sort_order_idx ON lead_sources(sort_order);

INSERT INTO lead_sources (name, sort_order) VALUES
  ('Facebook', 1),
  ('Instagram', 2),
  ('חברה המליצה', 3),
  ('Walk-in', 4),
  ('אחר', 5)
ON CONFLICT (name) DO NOTHING;
