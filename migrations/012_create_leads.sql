CREATE TABLE IF NOT EXISTS leads (
  id                   SERIAL PRIMARY KEY,
  form_id               INTEGER REFERENCES forms(id) ON DELETE SET NULL,
  campaign_id           INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
  source_channel        VARCHAR(20) NOT NULL CHECK (source_channel IN ('instagram','facebook','referral','other')),
  full_name             VARCHAR(200) NOT NULL,
  phone                 VARCHAR(50),
  email                 VARCHAR(255),
  consent_marketing     BOOLEAN NOT NULL DEFAULT FALSE,
  stage                 VARCHAR(20) NOT NULL DEFAULT 'new'
                         CHECK (stage IN ('new','qualified','contacted','scheduled','converted','lost')),
  lost_reason           VARCHAR(200),
  converted_customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  attribution           JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at          TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_stage_idx ON leads(stage);
CREATE INDEX IF NOT EXISTS leads_source_channel_idx ON leads(source_channel);
CREATE INDEX IF NOT EXISTS leads_campaign_id_idx ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS leads_form_id_idx ON leads(form_id);
CREATE INDEX IF NOT EXISTS leads_submitted_at_idx ON leads(submitted_at);
CREATE INDEX IF NOT EXISTS leads_phone_idx ON leads(phone);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
