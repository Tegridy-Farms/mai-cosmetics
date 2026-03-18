-- Add default_duration column to service_types
-- NULL means no default; otherwise the suggested duration (minutes) when logging income for this service type
ALTER TABLE service_types
ADD COLUMN IF NOT EXISTS default_duration INTEGER DEFAULT NULL;

COMMENT ON COLUMN service_types.default_duration IS 'Optional default duration in minutes when logging income for this service type';
