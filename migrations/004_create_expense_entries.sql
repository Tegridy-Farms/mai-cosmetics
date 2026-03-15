CREATE TABLE IF NOT EXISTS expense_entries (
  id         SERIAL PRIMARY KEY,
  date       DATE NOT NULL,
  category   VARCHAR(100) NOT NULL,
  amount     NUMERIC(10, 2) NOT NULL,
  notes      TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
