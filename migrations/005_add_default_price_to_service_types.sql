-- Add default_price column to service_types
-- NULL means no default; otherwise the suggested price when logging income for this service type
ALTER TABLE service_types
ADD COLUMN IF NOT EXISTS default_price NUMERIC(10, 2) DEFAULT NULL;

COMMENT ON COLUMN service_types.default_price IS 'Optional default price (₪) suggested when logging income for this service type';
