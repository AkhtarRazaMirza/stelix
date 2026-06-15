import type { Request, Response } from "express";
import { AssistantService } from "../services/assistant.service.js";

const assistantService = new AssistantService();

export class AssistantController {
  async chat(req: Request, res: Response) {
    try {
      const { message } = req.body;

      if (!message) {
        res.status(400).json({
          error: "Message is required",
        });
        return;
      }

      const response =
        await assistantService.handle(message);

      res.status(200).json({
        response,
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      });
    }
  }
}