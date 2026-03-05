import { EventEmitter } from "events";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/lib/prisma-client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize Prisma");
}

const prismaPool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
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

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPool = prismaPool;
}
