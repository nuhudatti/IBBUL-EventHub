/**
 * Vercel build: sync schema + seed demo users, then Next.js build.
 * Seed uses upserts — safe to run on every deploy.
 */
import { execSync } from "node:child_process";

function sanitizeDatabaseUrl(url) {
  if (!url) return url;
  let next = url.replace(/[?&]channel_binding=require/g, "");
  next = next.replace(/\?&/, "?").replace(/\?$/, "");
  // Migrations/schema push need Neon's direct host, not the pooler.
  if (next.includes("-pooler.")) {
    next = next.replace("-pooler.", ".");
    console.log("Using direct Neon host for schema sync (stripped -pooler).");
  }
  if (!next.includes("connect_timeout")) {
    next += next.includes("?") ? "&connect_timeout=30" : "?connect_timeout=30";
  }
  return next;
}

function run(cmd) {
  console.log(`> ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", env: process.env });
  } catch (error) {
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    throw error;
  }
}

const isVercel = Boolean(process.env.VERCEL);

if (isVercel && process.env.DATABASE_URL) {
  process.env.DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL);
  console.log("Syncing database schema on Vercel...");
  try {
    run("pnpm exec prisma db push --accept-data-loss --skip-generate");
    console.log("Seeding demo users (admin@nexus.dev, etc.)...");
    run("pnpm exec tsx prisma/seed.ts");
  } catch (error) {
    console.error("Database setup failed. Check Vercel DATABASE_URL (Neon direct URL, sslmode=require).");
    console.error(error?.message ?? error);
    process.exit(1);
  }
} else if (isVercel && !process.env.DATABASE_URL) {
  console.warn("VERCEL build without DATABASE_URL — skipping database setup");
}

run("pnpm exec prisma generate");
run("pnpm exec next build");
