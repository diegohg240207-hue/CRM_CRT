#!/bin/sh
set -e

echo "[start.sh] Running prisma migrate deploy..."
npx prisma migrate deploy

echo "[start.sh] Starting node dist/main..."
exec node dist/main
