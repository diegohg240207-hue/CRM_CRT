#!/bin/sh
set -e

echo "[start.sh] Running prisma migrate deploy..."
npx prisma migrate deploy

echo "[start.sh] Running prisma seed (upsert — idempotent)..."
npx ts-node prisma/seed.ts || echo "[start.sh] Seed skipped or already up to date"

echo "[start.sh] Starting node dist/main..."
exec node dist/main
