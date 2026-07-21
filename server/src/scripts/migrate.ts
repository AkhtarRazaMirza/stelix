import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { env } from "../env.js";
import { logger } from "../config/logger.js";

/**
 * Production migration runner.
 *
 * Uses drizzle-orm's runtime migrator (a *runtime* dependency) instead of the
 * `drizzle-kit` CLI (a dev dependency), so migrations can run in a production
 * image built with `npm ci --omit=dev`.
 *
 * Safety properties:
 *   - Idempotent: drizzle records applied migrations in the
 *     `__drizzle_migrations` table and skips any already applied, so re-running
 *     is a no-op. Safe to run on every deploy.
 *   - Forward-only: it applies the SQL files under ./drizzle in journal order;
 *     it never drops tables or data unless a migration file explicitly does so
 *     (our generated migrations are additive — see the expand/contract note in
 *     the deployment docs).
 *   - Fails the deploy loudly (exit 1) if a migration errors, so broken schema
 *     changes never reach a running server.
 *
 * Runs against its own short-lived pool that is always closed, so the process
 * exits cleanly in CI / the release phase.
 */
async function runMigrations(): Promise<void> {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 10_000,
    ...(env.NODE_ENV === "production"
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });

  const db = drizzle(pool);

  try {
    logger.info("Running database migrations");
    await migrate(db, { migrationsFolder: "./drizzle" });
    logger.info("Database migrations complete");
  } finally {
    await pool.end();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error("Database migration failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    process.exit(1);
  });
