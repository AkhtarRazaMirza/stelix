import { Pool } from "pg";

import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";

import { env } from "./env.js";

// Corsair owns its own pool (separate from the app's drizzle pool). Exported
// so it can be drained on graceful shutdown alongside the main pool.
export const corsairPool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ...(env.NODE_ENV === "production"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

export const corsair = createCorsair({
  plugins: [
    gmail(),
    googlecalendar(),
  ],
  database: corsairPool,
  kek: env.CORSAIR_KEK,
  multiTenancy: true,
});