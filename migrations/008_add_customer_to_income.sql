ALTER TABLE income_entries
ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);

CREATE INDEX IF NOT EXISTS income_entries_customer_id_idx ON income_entries(customer_id);
