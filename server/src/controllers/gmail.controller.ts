import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { GmailService } from "../services/gmail.service.js";
import { logger } from "../config/logger.js";
import type { SendEmailInput } from "../types/gmail.types.js";

const gmailService = new GmailService();

export class GmailController {
  async getInbox(req: AuthRequest, res: Response) {
    const pageToken = req.query.pageToken as string | undefined;

    logger.info("GET /api/gmail/inbox", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const data = await gmailService.getInbox(req.userId!, pageToken);

    res.status(200).json(data);
  }

  async getSentEmails(req: AuthRequest, res: Response) {
    const pageToken = req.query.pageToken as string | undefined;

    logger.info("GET /api/gmail/sent", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const data = await gmailService.getSentEmails(req.userId!, pageToken);

    res.status(200).json(data);
  }

  async searchEmails(req: AuthRequest, res: Response) {
    const query = req.query.q as string;

    logger.info("GET /api/gmail/search", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const data = await gmailService.searchEmails(req.userId!, query);

    res.status(200).json(data);
  }

  async refreshInbox(req: AuthRequest, res: Response) {
    logger.info("POST /api/gmail/refresh", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const data = await gmailService.refreshInbox(req.userId!);

    res.status(200).json(data);
  }

  async getEmail(req: AuthRequest, res: Response) {
    const emailId = req.params.emailId as string;

    logger.info("GET /api/gmail/emails/:emailId", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      emailId,
    });

    const email = await gmailService.getEmail(req.userId!, emailId);

    res.status(200).json({ email });
  }

  async sendEmail(req: AuthRequest, res: Response) {
    const input = req.body as SendEmailInput;

    logger.info("POST /api/gmail/send", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const result = await gmailService.sendEmail(req.userId!, input);

    res.status(201).json(result);
  }
}
