import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 runs on driver adapters. `@prisma/adapter-pg` speaks the standard
 * Postgres wire protocol, so the same code serves Neon, Supabase, RDS or a
 * self-hosted Postgres — only DATABASE_URL changes.
 *
 * On Neon, DATABASE_URL must be the *pooled* string (the host containing
 * `-pooler`). Migrations use DIRECT_URL instead, because DDL over PgBouncer is
 * unreliable — see prisma7.config.ts.
 */

/**
 * Each serverless instance opens its own pool, so a large `max` multiplies
 * across every warm lambda and exhausts the database. Serverless platforms
 * handle one request per instance at a time, so a couple of connections is
 * plenty; a long-lived server can afford more.
 */
function poolSize() {
  const configured = Number(process.env.DATABASE_POOL_MAX);
  if (Number.isFinite(configured) && configured > 0) return configured;
  const serverless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  return serverless ? 3 : 10;
}

const makeClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Postgres connection string.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: poolSize(),
      // Neon drops idle connections; recycle before it does so we never hand
      // a dead socket to a query.
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Created on first use rather than at import. Next imports every module while
 * collecting page data at build time, and a build that has no database
 * connection string should still succeed — it only needs one at request time.
 */
function client(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = makeClient() as unknown as PrismaClient;
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(client(), property, receiver);
  },
  has(_target, property) {
    return property in client();
  },
});
