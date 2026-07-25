import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { DashboardService } from "../services/dashboard.service.js";
import { logger } from "../config/logger.js";

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response) {
    logger.info("GET /api/dashboard", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const data = await dashboardService.getDashboardData(req.userId!);

    res.status(200).json(data);
  }
}
