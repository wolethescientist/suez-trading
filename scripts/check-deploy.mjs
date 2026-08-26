/**
 * Pre-deployment check. Verifies the environment is complete and that the
 * database is reachable, before a misconfiguration reaches production.
 *
 *   npm run check:deploy
 */
import "dotenv/config";

const problems = [];
const warnings = [];
const ok = [];

const env = (key) => process.env[key]?.trim();

// ---------------------------------------------------------------- database
const url = env("DATABASE_URL");
const direct = env("DIRECT_URL");

if (!url) {
  problems.push("DATABASE_URL is not set.");
} else if (!/^postgres(ql)?:\/\//.test(url)) {
  problems.push("DATABASE_URL is not a Postgres connection string.");
} else {
  ok.push("DATABASE_URL is set.");
  const neon = url.includes("neon.tech");
  if (neon && !url.includes("-pooler")) {
    warnings.push(
      "DATABASE_URL points at Neon's direct host. Use the POOLED string (host contains '-pooler') for the app, or serverless functions will exhaust the connection limit.",
    );
  }
  if (neon && !url.includes("sslmode=require")) {
    warnings.push("Neon connection strings should include ?sslmode=require.");
  }
  if (!direct) {
    warnings.push("DIRECT_URL is not set. Migrations will run over the pooled connection, which can fail on Neon.");
  } else if (direct.includes("-pooler")) {
    warnings.push("DIRECT_URL should be the UNPOOLED Neon host — migrations need a direct connection.");
  } else {
    ok.push("DIRECT_URL is set for migrations.");
  }
}

// ------------------------------------------------------------------- auth
const secret = env("AUTH_SECRET");
if (!secret) {
  problems.push("AUTH_SECRET is not set. Admin sign-in will fail.");
} else if (secret.length < 32) {
  problems.push(`AUTH_SECRET is only ${secret.length} characters; use at least 32.`);
} else if (secret.startsWith("dev-only")) {
  problems.push("AUTH_SECRET is still the development placeholder. Generate a new one.");
} else {
  ok.push("AUTH_SECRET is set.");
}

// ---------------------------------------------------------------- payments
const demo = env("DEMO_PAYMENTS")?.toLowerCase();
const paystack = env("PAYSTACK_SECRET_KEY");

if (demo === "true") {
  warnings.push("DEMO_PAYMENTS is 'true' — payments are SIMULATED. Fine for a stakeholder demo, not for taking money.");
} else if (!paystack) {
  problems.push("PAYSTACK_SECRET_KEY is not set and DEMO_PAYMENTS is not 'true' — checkout will refuse every order.");
} else {
  if (paystack.startsWith("sk_test_")) {
    warnings.push("PAYSTACK_SECRET_KEY is a TEST key. Swap for the live key before taking real payments.");
  }
  ok.push("Paystack is configured.");
}

// ----------------------------------------------------------------- storage
const cloudinary = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missingCloudinary = cloudinary.filter((k) => !env(k));
const serverless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (missingCloudinary.length === 0) {
  ok.push("Cloudinary is configured.");
} else if (serverless) {
  problems.push(
    `Cloudinary is incomplete (missing ${missingCloudinary.join(", ")}). This platform has no persistent disk, so image uploads will fail.`,
  );
} else {
  warnings.push(
    `Cloudinary is incomplete (missing ${missingCloudinary.join(", ")}). Uploads will fall back to public/uploads, which does not survive a serverless deploy.`,
  );
}

// --------------------------------------------------------------------- app
const site = env("NEXT_PUBLIC_SITE_URL");
if (!site) {
  problems.push("NEXT_PUBLIC_SITE_URL is not set. Paystack callbacks and canonical URLs will be wrong.");
} else if (site.includes("localhost") && process.env.NODE_ENV === "production") {
  problems.push("NEXT_PUBLIC_SITE_URL still points at localhost.");
} else {
  ok.push(`NEXT_PUBLIC_SITE_URL is ${site}`);
}

// --------------------------------------------------- database reachability
if (url) {
  try {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { PrismaClient } = await import("../lib/generated/prisma/client.ts");
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 1 }) });
    const [{ count }] = await prisma.$queryRaw`select count(*)::int as count from "Product"`;
    ok.push(`Database reachable — ${count} products in the catalogue.`);
    await prisma.$disconnect();
  } catch (error) {
    problems.push(
      `Could not query the database: ${error instanceof Error ? error.message.split("\n")[0] : error}`,
    );
  }
}

// ------------------------------------------------------------------ report
const line = "─".repeat(64);
console.log(`\n${line}\nSuez Trading — deployment check\n${line}`);
for (const item of ok) console.log(`  PASS  ${item}`);
for (const item of warnings) console.log(`  WARN  ${item}`);
for (const item of problems) console.log(`  FAIL  ${item}`);
console.log(line);
console.log(`${ok.length} passed, ${warnings.length} warning(s), ${problems.length} blocker(s).\n`);

process.exit(problems.length > 0 ? 1 : 0);
