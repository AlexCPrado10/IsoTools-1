CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS industrial_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    platform_version TEXT NOT NULL,
    module_id TEXT NOT NULL,
    module_version TEXT,
    asset_id TEXT NOT NULL,
    asset_type TEXT,
    plant_id TEXT,
    area_id TEXT,
    line_id TEXT,
    location TEXT,
    event_type TEXT NOT NULL,
    category TEXT,
    severity TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    correlation_id TEXT,
    causation_id TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migración idempotente para bases ya existentes (no rompe instalaciones previas).
-- correlation_id: agrupa todos los eventos de una misma cadena causal.
-- causation_id:  apunta al event_id del evento "padre" que disparó este.
ALTER TABLE industrial_events ADD COLUMN IF NOT EXISTS correlation_id TEXT;
ALTER TABLE industrial_events ADD COLUMN IF NOT EXISTS causation_id TEXT;

CREATE INDEX IF NOT EXISTS idx_industrial_events_event_id ON industrial_events (event_id);
CREATE INDEX IF NOT EXISTS idx_industrial_events_timestamp ON industrial_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_industrial_events_module_id ON industrial_events (module_id);
CREATE INDEX IF NOT EXISTS idx_industrial_events_plant_id ON industrial_events (plant_id);
CREATE INDEX IF NOT EXISTS idx_industrial_events_asset_id ON industrial_events (asset_id);
CREATE INDEX IF NOT EXISTS idx_industrial_events_correlation_id ON industrial_events (correlation_id);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT ARRAY['events:read','events:write'],
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys (active);

-- Basic read-only role for future dashboards/BI tools
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'industrial_reader') THEN
      CREATE ROLE industrial_reader LOGIN PASSWORD 'industrial_reader';
      EXECUTE format('GRANT CONNECT ON DATABASE %I TO industrial_reader', current_database());
      GRANT USAGE ON SCHEMA public TO industrial_reader;
      GRANT SELECT ON industrial_events TO industrial_reader;
   END IF;
END$$;
