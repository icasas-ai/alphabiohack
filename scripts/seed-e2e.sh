#!/bin/sh
set -eu

if [ -f ./.env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

exec npx tsx prisma/seeds/e2e.ts
