import { Router } from "express";

import { DashboardController } from "../controllers/dashboard.controller.js";

import { verifyAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

const dashboardController =
  new DashboardController();

router.get(
  "/",
  verifyAccessToken,
  (req, res) =>
    dashboardController.getDashboard(
      req,
      res
    )
);

export const dashboardRoutes =
  router;