import { and, eq } from "drizzle-orm";

import { db } from "../config/db.js";
import { integrationsTable } from "../models/integrations.js";
import type {
  CreateIntegrationInput,
  Integration,
  IntegrationProvider,
  UpdateIntegrationInput,
} from "../types/integration.types.js";

function mapRow(row: typeof integrationsTable.$inferSelect): Integration {
  return {
    id: row.id,
    userId: row.userId,
    provider: row.provider as IntegrationProvider,
    corsairAccountId: row.corsairAccountId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class IntegrationRepository {
  async getByUserId(userId: string): Promise<Integration[]> {
    const rows = await db
      .select()
      .from(integrationsTable)
      .where(eq(integrationsTable.userId, userId));

    return rows.map(mapRow);
  }

  async getByProvider(
    userId: string,
    provider: IntegrationProvider
  ): Promise<Integration | null> {
    const [row] = await db
      .select()
      .from(integrationsTable)
      .where(
        and(
          eq(integrationsTable.userId, userId),
          eq(integrationsTable.provider, provider)
        )
      )
      .limit(1);

    return row ? mapRow(row) : null;
  }

  async getUserIntegration(
    userId: string,
    integrationId: string
  ): Promise<Integration | null> {
    const [row] = await db
      .select()
      .from(integrationsTable)
      .where(
        and(
          eq(integrationsTable.userId, userId),
          eq(integrationsTable.id, integrationId)
        )
      )
      .limit(1);

    return row ? mapRow(row) : null;
  }

  async create(input: CreateIntegrationInput): Promise<Integration> {
    const [row] = await db
      .insert(integrationsTable)
      .values({
        userId: input.userId,
        provider: input.provider,
        corsairAccountId: input.corsairAccountId,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create integration");
    }

    return mapRow(row);
  }

  async update(
    integrationId: string,
    input: UpdateIntegrationInput
  ): Promise<Integration | null> {
    const [row] = await db
      .update(integrationsTable)
      .set(input)
      .where(eq(integrationsTable.id, integrationId))
      .returning();

    return row ? mapRow(row) : null;
  }

  async delete(integrationId: string): Promise<boolean> {
    const result = await db
      .delete(integrationsTable)
      .where(eq(integrationsTable.id, integrationId))
      .returning({ id: integrationsTable.id });

    return result.length > 0;
  }
}
