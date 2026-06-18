import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AgentService } from "../agents/agent.service.js";
import { logger } from "../config/logger.js";

const agentService = new AgentService();

export class AgentController {
  async chat(req: AuthRequest, res: Response) {
    const { message } = req.body as { message: string };

    logger.info("POST /api/agent/chat", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      messageLength: message.length,
    });

    const result = await agentService.chat(req.userId!, message);

    res.status(200).json(result);
  }
}
