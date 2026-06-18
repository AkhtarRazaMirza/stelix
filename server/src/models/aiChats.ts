import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user.js";

export const aiChatsTable = pgTable(
  "ai_chats",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    role: text("role").notNull(),

    message: text("message").notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("ai_chats_user_id_idx").on(table.userId),
  ]
);