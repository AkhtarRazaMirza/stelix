import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import type { IntegrationProvider } from "../types/integration.types.js";
import { IntegrationService } from "../services/integration.service.js";
import { OAuthService } from "../services/oauth.service.js";
import { env } from "../env.js";
import { logger } from "../config/logger.js";

const integrationService = new IntegrationService();
const oauthService = new OAuthService();

export class IntegrationController {
  public async getIntegrations(req: AuthRequest, res: Response) {
    logger.info("GET /api/integrations", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const integrations = await integrationService.getIntegrations(req.userId!);

    res.status(200).json({ integrations });
  }

  public async connectIntegration(req: AuthRequest, res: Response) {
    const provider = req.params.provider as IntegrationProvider;

    logger.info("POST /api/integrations/:provider/connect", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      provider,
    });

    const result = await oauthService.getConnectUrl(req.userId!, provider);

    res.status(200).json(result);
  }

  public async oauthCallback(req: AuthRequest, res: Response) {
    const { code, state } = req.query as { code: string; state: string };

    logger.info("GET /api/integrations/callback", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    try {
      const { provider } = await oauthService.handleCallback(
        req.userId!,
        code,
        state
      );

      res.redirect(`${env.APP_URL}/settings?connected=${provider}`);
    } catch (error) {
      logger.warn("OAuth callback failed", {
        userId: req.userId,
        requestId: req.requestId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.redirect(`${env.APP_URL}/settings?error=oauth_failed`);
    }
  }

  public async disconnectIntegration(req: AuthRequest, res: Response) {
    const id = req.params.id as string;

    logger.info("DELETE /api/integrations/:id", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      integrationId: id,
    });

    const result = await integrationService.disconnectIntegration(
      req.userId!,
      id
    );

    res.status(200).json(result);
  }
}
