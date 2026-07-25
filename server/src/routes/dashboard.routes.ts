import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import {
  requireUserId,
  verifyAccessToken,
} from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/validate.middleware.js";

const router = Router();
const controller = new DashboardController();

router.get(
  "/",
  verifyAccessToken,
  requireUserId,
  asyncHandler((req, res) => controller.getDashboard(req, res))
);

export const dashboardRoutes = router;
