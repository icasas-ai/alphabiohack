#!/bin/sh
set -eu

seed_script="./scripts/seed-local.sh"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --demo)
      seed_script="./scripts/seed-demo.sh"
      ;;
    --e2e)
      seed_script="./scripts/seed-e2e.sh"
      ;;
    --help|-h)
      cat <<'EOF'
Usage: npm run db:reset -- [--demo|--e2e]

Resets the local database and reseeds it.
  --demo  Run the realistic demo seed for sales/demo walkthroughs.
  --e2e   Run the synthetic e2e seed instead of the default local seed.
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: npm run db:reset -- [--demo|--e2e]" >&2
      exit 1
      ;;
  esac
  shift
done

sh ./scripts/prisma-local.sh migrate reset --force
sh "$seed_script"
