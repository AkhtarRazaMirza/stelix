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

const INTEGRATION_CACHE_TTL_MS = 30_000;
const integrationCache = new Map<string, { data: Integration[]; fetchedAt: number }>();

export class IntegrationRepository {
  private invalidateCache(userId: string) {
    integrationCache.delete(userId);
  }

  async getByUserId(userId: string): Promise<Integration[]> {
    const cached = integrationCache.get(userId);
    if (cached && Date.now() - cached.fetchedAt < INTEGRATION_CACHE_TTL_MS) {
      return cached.data;
    }

    const rows = await db
      .select()
      .from(integrationsTable)
      .where(eq(integrationsTable.userId, userId));

    const result = rows.map(mapRow);
    integrationCache.set(userId, { data: result, fetchedAt: Date.now() });
    return result;
  }

  async getByProvider(
    userId: string,
    provider: IntegrationProvider
  ): Promise<Integration | null> {
    const integrations = await this.getByUserId(userId);
    return integrations.find((item) => item.provider === provider) ?? null;
  }

  async getUserIntegration(
    userId: string,
    integrationId: string
  ): Promise<Integration | null> {
    const integrations = await this.getByUserId(userId);
    return integrations.find((item) => item.id === integrationId) ?? null;
  }

  async create(input: CreateIntegrationInput): Promise<Integration> {
    this.invalidateCache(input.userId);

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

    if (row) {
      this.invalidateCache(row.userId);
    }

    return row ? mapRow(row) : null;
  }

  async delete(integrationId: string): Promise<boolean> {
    const result = await db
      .delete(integrationsTable)
      .where(eq(integrationsTable.id, integrationId))
      .returning({ id: integrationsTable.id, userId: integrationsTable.userId });

    if (result.length > 0 && result[0]?.userId) {
      this.invalidateCache(result[0].userId);
    }

    return result.length > 0;
  }
}
