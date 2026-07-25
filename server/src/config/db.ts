import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "../env.js";
import { logger } from "./logger.js";

/**
 * Single, explicitly-configured PostgreSQL connection pool for the app.
 *
 * Previously this read `process.env.DATABASE_URL!` directly and let drizzle
 * create an implicit pool with default settings. That bypassed the validated
 * `env` module and gave us no handle to the pool for graceful shutdown or
 * timeout tuning. We now:
 *   - read the validated `env.DATABASE_URL` (fails fast at boot if missing),
 *   - own the `Pool` so it can be drained on SIGTERM (see index.ts),
 *   - set conservative timeouts so a dead connection can't hang a request,
 *   - enable TLS in production (managed Postgres such as Neon/Render requires
 *     it; `rejectUnauthorized:false` matches their pooled-connection certs).
 */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Bound the pool so we never exhaust the database's connection limit under
  // load. Render/Neon free tiers cap low; 10 is a safe default and can be
  // raised via infra config later without code changes.
  max: 10,
  // Close idle clients after 30s so we don't hold connections open needlessly.
  idleTimeoutMillis: 30_000,
  // Fail fast (5s) if a new connection can't be established, instead of hanging.
  connectionTimeoutMillis: 5_000,
  ...(env.NODE_ENV === "production"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

// Surface pool-level errors (e.g. a backend connection dropped by the DB) so
// they are logged instead of crashing the process with an unhandled 'error'.
pool.on("error", (error) => {
  logger.error("Unexpected PostgreSQL pool error", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
});

export const db = drizzle(pool);
