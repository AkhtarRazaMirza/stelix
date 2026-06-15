import { Router } from "express";

import { AssistantController } from "../controllers/assistant.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

const assistantController =
  new AssistantController();

router.post(
  "/",
  verifyAccessToken,
  (req, res) =>
    assistantController.chat(req, res)
);

export const assistantRoutes =
  router;