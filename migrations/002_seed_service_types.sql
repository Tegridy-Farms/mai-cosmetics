INSERT INTO service_types (name) VALUES
  ('Manicure'),
  ('Pedicure'),
  ('Gel Nails'),
  ('Acrylic Nails'),
  ('Nail Art'),
  ('Eyebrow Shaping'),
  ('Eyelash Treatment'),
  ('Facial'),
  ('Other')
ON CONFLICT DO NOTHING;
