import type {
  Request,
  Response,
} from "express";

import { DashboardService } from "../services/dashboard.service.js";

const dashboardService =
  new DashboardService();

export class DashboardController {
  async getDashboard(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await dashboardService.getDashboardData();

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        message:
          (error as Error).message,
      });
    }
  }
}