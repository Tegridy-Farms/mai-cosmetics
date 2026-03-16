#!/usr/bin/env bash
set -euo pipefail

# Load DATABASE_URL from .env.local or .env (avoids issues with & and other special chars in URLs)
if [ -z "${DATABASE_URL:-}" ]; then
  for envfile in .env.local .env; do
    if [ -f "$envfile" ]; then
      while IFS= read -r line || [ -n "$line" ]; do
        line="${line%$'\r'}"  # strip CR for Windows line endings
        [[ "$line" =~ ^[[:space:]]*#.*$ || -z "$line" ]] && continue
        if [[ "$line" =~ ^[[:space:]]*DATABASE_URL=(.*)$ ]]; then
          export DATABASE_URL="${BASH_REMATCH[1]//[\"\']}"
          break 2
        fi
      done < "$envfile"
    fi
  done
  # Fallback to POSTGRES_URL (used by Vercel/Neon)
  if [ -z "${DATABASE_URL:-}" ] && [ -f .env.local ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
      if [[ "$line" =~ ^POSTGRES_URL=(.*)$ ]]; then
        export DATABASE_URL="${BASH_REMATCH[1]//[\"\']}"
        break
      fi
    done < .env.local
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Add it to .env.local or export it." >&2
  echo "  Example: DATABASE_URL=postgresql://user:pass@host/dbname" >&2
  exit 1
fi

echo "Running migrations…"

for file in migrations/*.sql; do
  echo "  → $file"
  psql "$DATABASE_URL" -f "$file"
done

echo "Migrations complete."
