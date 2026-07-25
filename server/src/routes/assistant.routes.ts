import { Router } from "express";
import { AssistantController } from "../controllers/assistant.controller.js";
import {
  requireUserId,
  verifyAccessToken,
} from "../middleware/auth.middleware.js";
import { asyncHandler, validate } from "../middleware/validate.middleware.js";
import { assistantChatSchema } from "../validations/assistant.validation.js";

const router = Router();
const controller = new AssistantController();

router.post(
  "/",
  verifyAccessToken,
  requireUserId,
  validate({ body: assistantChatSchema }),
  asyncHandler((req, res) => controller.chat(req, res))
);

export const assistantRoutes = router;
