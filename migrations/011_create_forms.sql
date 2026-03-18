CREATE TABLE IF NOT EXISTS forms (
  id          SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  status      VARCHAR(20) NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft','published','archived')),
  ui_schema   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS forms_campaign_id_idx ON forms(campaign_id);
CREATE INDEX IF NOT EXISTS forms_status_idx ON forms(status);
CREATE INDEX IF NOT EXISTS forms_created_at_idx ON forms(created_at);
