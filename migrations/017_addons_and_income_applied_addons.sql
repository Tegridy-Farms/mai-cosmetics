CREATE TABLE IF NOT EXISTS addons (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(100) NOT NULL UNIQUE,
  price             NUMERIC(10,2) NOT NULL CHECK (price > 0),
  service_type_ids  INTEGER[] NOT NULL DEFAULT '{}',
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS addons_sort_order_idx ON addons(sort_order);

ALTER TABLE income_entries
  ADD COLUMN IF NOT EXISTS applied_addon_ids INTEGER[] NOT NULL DEFAULT '{}';
