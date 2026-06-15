import { Router } from "express";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import { IntegrationController } from "../controllers/integration.controller.js";

const router = Router();
const controller =
  new IntegrationController();

router.get(
  "/",
  verifyAccessToken,
  (req, res) =>
    controller.getIntegrations(
      req,
      res
    )
);

router.post(
  "/connect",
  verifyAccessToken,
  (req, res) =>
    controller.connectIntegration(
      req,
      res
    )
);

router.delete(
  "/:id",
  verifyAccessToken,
  (req, res) =>
    controller.disconnectIntegration(
      req,
      res
    )
);

export const integrationRoutes =
  router;
  