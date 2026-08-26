import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations run over a direct (unpooled) connection. On Neon the pooled
    // host cannot run DDL reliably, so DIRECT_URL is preferred when present.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
