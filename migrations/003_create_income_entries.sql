CREATE TABLE IF NOT EXISTS income_entries (
  id               SERIAL PRIMARY KEY,
  service_name     VARCHAR(255) NOT NULL,
  service_type_id  INTEGER NOT NULL REFERENCES service_types(id),
  date             DATE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  amount           NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS income_entries_date_idx ON income_entries(date);
CREATE INDEX IF NOT EXISTS income_entries_service_type_idx ON income_entries(service_type_id);
