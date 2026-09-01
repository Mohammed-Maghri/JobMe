import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { serverEnv } from "./env";

/**
 * Prisma 7 talks to PostgreSQL through a driver adapter rather than a bundled
 * query engine, so the connection string is handed to `PrismaPg` here.
 *
 * The instance is cached on `globalThis` because Next.js re-evaluates modules on
 * every hot reload in development; without the cache each edit would open a new
 * connection pool until PostgreSQL refused them.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: serverEnv.databaseUrl }),
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
