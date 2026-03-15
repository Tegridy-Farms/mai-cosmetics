#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

echo "Running migrations…"

for file in migrations/*.sql; do
  echo "  → $file"
  psql "$DATABASE_URL" -f "$file"
done

echo "Migrations complete."
