/**
 * Vercel build: migrate DB (Neon reachable from Vercel), optional seed, then Next.js build.
 * Set RUN_DB_SEED=1 on Vercel once for demo users, then remove it.
 */
import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

const isVercel = Boolean(process.env.VERCEL);

if (isVercel && process.env.DATABASE_URL) {
  try {
    run("npx prisma migrate deploy");
    if (process.env.RUN_DB_SEED === "1") {
      console.log("RUN_DB_SEED=1 — seeding database...");
      run("npx tsx prisma/seed.ts");
    }
  } catch (error) {
    console.error("Database migrate failed:", error);
    process.exit(1);
  }
} else if (isVercel && !process.env.DATABASE_URL) {
  console.warn("VERCEL build without DATABASE_URL — skipping migrate deploy");
}

run("npx prisma generate");
run("npx next build");
