#!/bin/sh
set -eu

if [ -f ./.env.production ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.production
  set +a
fi

exec npx tsx prisma/seeds/production.ts
