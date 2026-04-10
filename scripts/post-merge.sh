#!/bin/bash
set -e
pnpm install --frozen-lockfile

# Apply SQL migrations (idempotent — safe to run multiple times)
if [ -n "$DATABASE_URL" ]; then
  for f in lib/db/migrations/*.sql; do
    [ -f "$f" ] && psql "$DATABASE_URL" -f "$f" --quiet
  done
fi

# Sync Drizzle schema (applies any remaining schema changes)
pnpm --filter @workspace/db push
