import { assertIntegrationOwnership } from "../authorization/integration.authorization.js";
import { logger } from "../config/logger.js";
import { NotFoundError } from "../errors/app.errors.js";
import { IntegrationRepository } from "../repositories/integration.repository.js";
import { CorsairService } from "./corsair.service.js";
import {
  INTEGRATION_PROVIDERS,
  type IntegrationProvider,
} from "../types/integration.types.js";

export class IntegrationService {
  constructor(
    private readonly integrationRepository = new IntegrationRepository(),
    private readonly corsairService = new CorsairService()
  ) {}

  public async getIntegrations(userId: string) {
    logger.info("Fetching user integrations", { userId });

    const integrations =
      await this.integrationRepository.getByUserId(userId);

    const status = await this.corsairService.connectionStatus(userId);

    const byProvider = new Map(
      integrations.map((integration) => [integration.provider, integration])
    );

    return INTEGRATION_PROVIDERS.map((provider) => {
      const integration = byProvider.get(provider);

      return {
        id: integration?.id ?? null,
        provider,
        connected: status[provider] === "connected",
        corsairAccountId: integration?.corsairAccountId ?? null,
      };
    });
  }

  public async disconnectIntegration(
    userId: string,
    integrationId: string
  ) {
    const integration = await assertIntegrationOwnership(userId, integrationId);

    const deleted = await this.integrationRepository.delete(integrationId);

    if (!deleted) {
      throw new NotFoundError("Integration not found");
    }

    await this.corsairService.clearAccount(
      userId,
      integration.provider as IntegrationProvider
    );

    logger.info("Disconnected integration", {
      userId,
      integrationId,
    });

    return {
      success: true,
    };
  }
}
