CREATE TABLE IF NOT EXISTS expense_entries (
  id          SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  category    VARCHAR(50) NOT NULL CHECK (category IN ('equipment','materials','consumables','other')),
  date        DATE NOT NULL,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expense_entries_date_idx ON expense_entries(date);
CREATE INDEX IF NOT EXISTS expense_entries_category_idx ON expense_entries(category);
