import { EventEmitter } from "events";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { resolveDatabaseUrl } from "@/lib/database-url";
import { PrismaClient } from "@/lib/prisma-client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
};

function parsePositiveIntEnv(name: string, fallback: number) {
  const value = process.env[name];
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const isServerlessRuntime = Boolean(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.AWS_EXECUTION_ENV ||
  process.env.VERCEL,
);

const { url: databaseUrl } = resolveDatabaseUrl();

if (!databaseUrl) {
  throw new Error(
    "Database connection is required. Set DB_USER/DB_PASS/DB_HOST/DB_PORT/DB_NAME.",
  );
}

const poolMax = parsePositiveIntEnv(
  "DB_POOL_MAX",
  isServerlessRuntime ? 1 : 10,
);
const poolIdleTimeoutMillis = parsePositiveIntEnv(
  "DB_POOL_IDLE_TIMEOUT_MS",
  isServerlessRuntime ? 5000 : 30000,
);

const prismaPool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString: databaseUrl,
    max: poolMax,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: poolIdleTimeoutMillis,
    allowExitOnIdle: isServerlessRuntime,
  });

const prismaAdapter = new PrismaPg(prismaPool);

// Mitigación: aumentar límite de listeners globales para evitar MaxListenersExceededWarning
// Nota: Esto no resuelve la causa raíz, pero evita el warning en entornos con muchas suscripciones implícitas a sockets
EventEmitter.defaultMaxListeners = Math.max(
  EventEmitter.defaultMaxListeners || 10,
  50
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: prismaAdapter,
  });

globalForPrisma.prisma = prisma;
globalForPrisma.prismaPool = prismaPool;
