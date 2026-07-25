import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AssistantService } from "../services/assistant.service.js";
import { logger } from "../config/logger.js";

const assistantService = new AssistantService();

export class AssistantController {
  async chat(req: AuthRequest, res: Response) {
    const { message } = req.body as { message: string };

    logger.info("POST /api/assistant", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      messageLength: message.length,
    });

    const response = await assistantService.handle(req.userId!, message);

    res.status(200).json({ response });
  }
}
