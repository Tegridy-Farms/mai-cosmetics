ALTER TABLE service_types
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE service_types st
SET sort_order = sub.rn
FROM (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY name ASC) - 1)::int AS rn
  FROM service_types
) sub
WHERE st.id = sub.id;

CREATE INDEX IF NOT EXISTS service_types_sort_order_idx ON service_types (sort_order);
