import { corsair } from "../corsair.js";
import type { IntegrationProvider } from "../types/integration.types.js";
import type { PluginConnectionState } from "corsair";
import { logger } from "../config/logger.js";

const CONNECTION_STATUS_CACHE_TTL_MS = 45_000;

interface CacheEntry {
  data: Record<string, PluginConnectionState>;
  fetchedAt: number;
}

const statusCache = new Map<string, CacheEntry>();
const inFlightStatusPromises = new Map<string, Promise<Record<string, PluginConnectionState>>>();

export class CorsairService {
  resolveTenant(userId: string) {
    return corsair.withTenant(userId);
  }

  logProviderOperation(
    userId: string,
    provider: IntegrationProvider,
    operation: string,
    meta?: Record<string, unknown>
  ) {
    logger.info(`Corsair ${operation}`, {
      userId,
      provider,
      ...meta,
    });
  }

  clearConnectionStatusCache(userId: string) {
    statusCache.delete(userId);
    inFlightStatusPromises.delete(userId);
  }

  async connectionStatus(
    userId: string
  ): Promise<Record<string, PluginConnectionState>> {
    const cached = statusCache.get(userId);
    if (cached && Date.now() - cached.fetchedAt < CONNECTION_STATUS_CACHE_TTL_MS) {
      return cached.data;
    }

    const inFlight = inFlightStatusPromises.get(userId);
    if (inFlight) {
      return inFlight;
    }

    const promise = (async () => {
      try {
        const status = await corsair.manage.connectionStatus.get({ tenantId: userId });
        statusCache.set(userId, { data: status, fetchedAt: Date.now() });
        return status;
      } finally {
        inFlightStatusPromises.delete(userId);
      }
    })();

    inFlightStatusPromises.set(userId, promise);
    return promise;
  }

  async clearAccount(userId: string, provider: IntegrationProvider) {
    this.clearConnectionStatusCache(userId);

    const tenant = corsair.withTenant(userId) as Record<string, any>;
    const account = tenant[provider]?.keys;

    if (!account) {
      return;
    }

    await account.set_access_token(null);
    await account.set_refresh_token(null);

    this.logProviderOperation(userId, provider, "clear_account");
  }
}
