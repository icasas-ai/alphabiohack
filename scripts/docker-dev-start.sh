#!/bin/sh
set -eu

echo "Generating Prisma client..."
npx prisma generate

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npm run db:seed

echo "Starting Next.js dev server..."
exec npm run dev -- --hostname 0.0.0.0
