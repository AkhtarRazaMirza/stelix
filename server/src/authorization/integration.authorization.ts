import { ForbiddenError } from "../errors/app.errors.js";
import { IntegrationRepository } from "../repositories/integration.repository.js";
import type { Integration } from "../types/integration.types.js";

export async function assertIntegrationOwnership(
  userId: string,
  integrationId: string,
  integrationRepository: IntegrationRepository = new IntegrationRepository()
): Promise<Integration> {
  const integration = await integrationRepository.getUserIntegration(
    userId,
    integrationId
  );

  if (!integration) {
    throw new ForbiddenError("Integration does not belong to this user");
  }

  return integration;
}
