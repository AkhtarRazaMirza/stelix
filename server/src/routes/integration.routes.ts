import { Router } from "express";
import { IntegrationController } from "../controllers/integration.controller.js";
import {
  requireUserId,
  verifyAccessToken,
} from "../middleware/auth.middleware.js";
import { asyncHandler, validate } from "../middleware/validate.middleware.js";
import {
  connectProviderParamSchema,
  oauthCallbackQuerySchema,
  integrationIdParamSchema,
} from "../validations/integration.validation.js";

const router = Router();
const controller = new IntegrationController();

router.get(
  "/",
  verifyAccessToken,
  requireUserId,
  asyncHandler((req, res) => controller.getIntegrations(req, res))
);

router.get(
  "/callback",
  verifyAccessToken,
  requireUserId,
  validate({ query: oauthCallbackQuerySchema }),
  asyncHandler((req, res) => controller.oauthCallback(req, res))
);

router.post(
  "/:provider/connect",
  verifyAccessToken,
  requireUserId,
  validate({ params: connectProviderParamSchema }),
  asyncHandler((req, res) => controller.connectIntegration(req, res))
);

router.delete(
  "/:id",
  verifyAccessToken,
  requireUserId,
  validate({ params: integrationIdParamSchema }),
  asyncHandler((req, res) => controller.disconnectIntegration(req, res))
);

export const integrationRoutes = router;
