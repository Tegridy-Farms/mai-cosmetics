CREATE TABLE IF NOT EXISTS customers (
  id                  SERIAL PRIMARY KEY,
  first_name          VARCHAR(100) NOT NULL,
  last_name           VARCHAR(100) NOT NULL,
  phone               VARCHAR(50),
  email               VARCHAR(255),
  lead_source_id      INTEGER REFERENCES lead_sources(id),
  questionnaire_data  JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customers_lead_source_idx ON customers(lead_source_id);
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers(email);
CREATE INDEX IF NOT EXISTS customers_phone_idx ON customers(phone);
