import { corsair } from "../corsair.js";
import type { IntegrationProvider } from "../types/integration.types.js";
import type { PluginConnectionState } from "corsair";
import { logger } from "../config/logger.js";

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

  async connectionStatus(
    userId: string
  ): Promise<Record<string, PluginConnectionState>> {
    return corsair.manage.connectionStatus.get({ tenantId: userId });
  }

  async clearAccount(userId: string, provider: IntegrationProvider) {
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
