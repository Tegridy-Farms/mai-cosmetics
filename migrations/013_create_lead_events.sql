CREATE TABLE IF NOT EXISTS lead_events (
  id         SERIAL PRIMARY KEY,
  lead_id    INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL
             CHECK (type IN ('stage_change','note','contact_attempt','conversion')),
  payload    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_events_lead_id_idx ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS lead_events_type_idx ON lead_events(type);
CREATE INDEX IF NOT EXISTS lead_events_created_at_idx ON lead_events(created_at);
