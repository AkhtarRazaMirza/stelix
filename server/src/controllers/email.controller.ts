import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { EmailService } from "../services/email.service.js";
import { logger } from "../config/logger.js";

const emailService = new EmailService();

export class EmailController {
  async getEmails(req: AuthRequest, res: Response) {
    logger.info("GET /api/emails", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const emails = await emailService.getEmails(req.userId!);

    res.status(200).json({ emails });
  }

  async searchEmails(req: AuthRequest, res: Response) {
    const query = req.query.q as string;

    logger.info("GET /api/emails/search", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      provider: "gmail",
    });

    const emails = await emailService.searchEmails(req.userId!, query);

    res.status(200).json({ emails });
  }

  async getEmailById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;

    logger.info("GET /api/emails/:id", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      provider: "gmail",
    });

    const email = await emailService.getEmailById(req.userId!, id);

    res.status(200).json({ email });
  }
}
