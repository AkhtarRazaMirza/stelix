import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user.js";

export const integrationsTable = pgTable(
  "integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    provider: text("provider").notNull(),

    corsairAccountId: text("corsair_account_id").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("integrations_user_id_idx").on(table.userId),
    uniqueIndex("integrations_user_provider_idx").on(
      table.userId,
      table.provider
    ),
  ]
);
