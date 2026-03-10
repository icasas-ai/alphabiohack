#!/bin/sh
set -eu

. ./scripts/load-env.sh ./.env.production

exec npx tsx prisma/seeds/production.ts
