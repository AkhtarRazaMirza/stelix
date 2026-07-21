import type { Server } from "node:http";

import { sql } from "drizzle-orm";

import { serverConfig } from "./config/server.js";
import { db, pool } from "./config/db.js";
import { corsairPool } from "./corsair.js";
import { env } from "./env.js";
import { logger } from "./config/logger.js";
import { bootstrapCorsairCredentials } from "./config/corsair.bootstrap.js";

// How long to wait for in-flight requests to drain on shutdown before forcing
// exit. Kept under typical platform kill timeouts (Render sends SIGTERM then
// SIGKILL after ~30s) so we always exit cleanly first.
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function startServer(): Promise<void> {
  logger.info("Starting Stelix API server", { env: env.NODE_ENV });

  const app = serverConfig();

  // Verify the database is reachable BEFORE we accept traffic, and configure
  // Corsair integration credentials. If either fails at boot, crash loudly so
  // the platform restarts us rather than serving a half-initialised process.
  await db.execute(sql`select 1`);
  logger.info("Database connection established");

  await bootstrapCorsairCredentials();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });

  registerShutdownHandlers(server);
}

/**
 * Graceful shutdown: stop accepting new connections, let in-flight requests
 * finish, then close both PG pools and exit. A hard timeout guarantees we
 * don't hang forever if a connection is stuck.
 */
function registerShutdownHandlers(server: Server): void {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`Received ${signal}, shutting down gracefully`);

    const forceExit = setTimeout(() => {
      logger.error("Shutdown timed out, forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    // Don't let this timer keep the event loop alive on a clean exit.
    forceExit.unref();

    try {
      // 1. Stop accepting new connections; wait for in-flight requests.
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info("HTTP server closed, draining connection pools");

      // 2. Close both connection pools so the process can exit cleanly.
      await Promise.allSettled([pool.end(), corsairPool.end()]);
      logger.info("Connection pools closed, exiting");

      clearTimeout(forceExit);
      process.exit(0);
    } catch (error) {
      logger.error("Error during graceful shutdown", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      clearTimeout(forceExit);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  // Never leave the process in an undefined state. Log and exit so the
  // platform restarts a fresh instance.
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
  });
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception, exiting", { error: error.message });
    process.exit(1);
  });
}

startServer().catch((error) => {
  logger.error("Fatal error during server startup", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
  process.exit(1);
});
