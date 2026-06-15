import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { IntegrationService } from "../services/integration.service.js";

const integrationService =
  new IntegrationService();

export class IntegrationController {
  public async getIntegrations(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const integrations =
        await integrationService.getIntegrations(
          req.userId!
        );

      res.status(200).json({
        integrations,
      });
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
      });
    }
  }

  public async connectIntegration(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const result =
        await integrationService.connectIntegration(
          req.userId!,
          req.body.provider
        );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
      });
    }
  }

  public async disconnectIntegration(
    req: AuthRequest,
    res: Response
  ) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if(!id) return res.status(400).json({ error: 'Integration ID not found' });
    try {
      const result =
        await integrationService.disconnectIntegration(
          id
        );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
      });
    }
  }
}