#!/bin/sh
set -eu

. ./scripts/load-env.sh ./.env.local

exec npx tsx prisma/seeds/e2e.ts
