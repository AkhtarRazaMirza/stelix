import type { Request, Response } from "express";
import { EmailService } from "../services/email.service.js";

const emailService = new EmailService();

export class EmailController {
  async getEmails(req: Request, res: Response) {
    const emails = await emailService.getEmails();

    res.status(200).json({
      emails,
    });
  }

  async getEmail(req: Request, res: Response) {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: "Invalid email ID" });
      return;
    }

    const email = await emailService.getEmailById(id);

    res.status(200).json({
      email,
    });
  }

  async sendEmail(req: Request, res: Response) {
    const result = await emailService.sendEmail(
      req.body
    );

    res.status(200).json(result);
  }
}
