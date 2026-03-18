CREATE TABLE IF NOT EXISTS campaigns (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  channel_focus VARCHAR(50) NOT NULL DEFAULT 'mixed'
                CHECK (channel_focus IN ('instagram','facebook','referral','mixed','other')),
  start_date    DATE,
  end_date      DATE,
  budget        NUMERIC(12,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campaigns_channel_focus_idx ON campaigns(channel_focus);
CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON campaigns(created_at);
