import { generateOAuthUrl, processOAuthCallback, decodeOAuthState } from "corsair/oauth";

import { corsair } from "../corsair.js";
import { env } from "../env.js";
import { logger } from "../config/logger.js";
import { ForbiddenError, ValidationError } from "../errors/app.errors.js";
import { IntegrationRepository } from "../repositories/integration.repository.js";
import type {
  IntegrationProvider,
  CreateIntegrationInput,
} from "../types/integration.types.js";

export class OAuthService {
  constructor(
    private readonly integrationRepository = new IntegrationRepository()
  ) {}

  public async getConnectUrl(userId: string, provider: IntegrationProvider) {
    logger.info("Generating OAuth connect URL", { userId, provider });

    const { url } = await generateOAuthUrl(corsair, provider, {
      tenantId: userId,
      redirectUri: env.CORSAIR_OAUTH_REDIRECT_URI,
    });

    return { url };
  }

  public async handleCallback(userId: string, code: string, state: string) {
    const decoded = decodeOAuthState(state);

    if (!decoded) {
      throw new ValidationError("Invalid or expired OAuth state");
    }

    if (decoded.tenantId !== userId) {
      throw new ForbiddenError("OAuth state does not belong to this user");
    }

    const { plugin } = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri: env.CORSAIR_OAUTH_REDIRECT_URI,
    });

    const provider = plugin as IntegrationProvider;

    await this.upsertIntegration(userId, provider);

    logger.info("OAuth callback completed", { userId, provider });

    return { provider };
  }

  private async upsertIntegration(
    userId: string,
    provider: IntegrationProvider
  ) {
    const existing = await this.integrationRepository.getByProvider(
      userId,
      provider
    );

    if (existing) {
      return existing;
    }

    return this.integrationRepository.create({
      userId,
      provider,
      corsairAccountId: userId,
    } satisfies CreateIntegrationInput);
  }
}
