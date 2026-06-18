import { IntegrationNotConnectedError } from "../errors/app.errors.js";
import { IntegrationRepository } from "../repositories/integration.repository.js";
import type {
  Integration,
  IntegrationProvider,
} from "../types/integration.types.js";

export class IntegrationGuard {
  constructor(
    private readonly integrationRepository: IntegrationRepository = new IntegrationRepository()
  ) {}

  async requireIntegration(
    userId: string,
    provider: IntegrationProvider
  ): Promise<Integration> {
    const integration = await this.integrationRepository.getByProvider(
      userId,
      provider
    );

    if (!integration) {
      throw new IntegrationNotConnectedError(provider);
    }

    return integration;
  }
}
