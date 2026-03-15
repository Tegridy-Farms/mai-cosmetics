CREATE TABLE IF NOT EXISTS income_entries (
  id              SERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  service_type_id INTEGER REFERENCES service_types(id) ON DELETE SET NULL,
  amount          NUMERIC(10, 2) NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
